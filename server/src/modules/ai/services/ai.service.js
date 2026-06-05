import OpenAI from "openai";
import env from "../../../config/env.js";
import { SYSTEM_PROMPT, LAB_KNOWLEDGE } from "../ai.knowledge.js";
import { AI_TOOLS } from "../ai.tools.js";

let client = null;
const getClient = () => {
  if (!client) client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  return client;
};

export const isConfigured = () => Boolean(env.OPENAI_API_KEY);

// activeData kalitlari uchun o'zbekcha yorliqlar (qolganlari xom kalit nomida).
const FIELD_LABELS = {
  formula: "Formula",
  weight: "Molyar massa",
  category: "Kategoriya",
  categoryLabel: "Kategoriya",
  state: "Holat",
  nameEn: "Inglizcha nomi",
  iupacName: "IUPAC nomi",
  symbol: "Belgi",
  number: "Tartib raqami",
  protons: "Protonlar soni",
  neutrons: "Neytronlar soni",
  shells: "Elektron qobiqlar",
  about: "Tavsif",
  distance: "Quyoshdan masofa (shartli)",
  speed: "Aylanish tezligi (shartli)",
  size: "Nisbiy o'lcham",
  amplitude: "Amplituda",
  frequency: "Chastota",
  type: "Turi",
};

// Tanlangan modelning real ma'lumotini "• Yorliq: qiymat" qatorlariga aylantiradi.
const renderActiveData = (data) =>
  Object.entries(data).map(
    ([k, v]) => `  • ${FIELD_LABELS[k] || k}: ${v}`,
  );

// Kimyo laboratoriyasining jonli holatini o'qiladigan satrlarga aylantiradi.
const renderLabState = (st) => {
  const out = [];
  if (Array.isArray(st.poured) && st.poured.length)
    out.push(`Idishga quyilgan: ${st.poured.join(", ")}`);
  else out.push("Idish hozir bo'sh");
  if (st.composition) {
    const comp = Object.entries(st.composition)
      .filter(([, n]) => n > 0)
      .map(([el, n]) => `${el}×${n}`)
      .join(", ");
    if (comp) out.push(`Tarkib (atomlar): ${comp}`);
  }
  if (st.product)
    out.push(
      `Aralashmadan aniqlangan modda: ${st.product}${st.productFormula ? ` (${st.productFormula})` : ""}`,
    );
  if (st.lastReaction) out.push(`Oxirgi reaksiya: ${st.lastReaction}`);
  if (st.temperatureLabel) out.push(`Harorat: ${st.temperatureLabel}`);
  else if (typeof st.heating === "boolean")
    out.push(`Isitish: ${st.heating ? "yoqilgan" : "o'chiq"}`);
  return out;
};

// Foydalanuvchining joriy holatini (qaysi mavzu, qaysi item, real ma'lumotlari,
// laboratoriya holati va oxirgi amallari) agentga matn sifatida beradi - shu
// orqali agent "kuzatadi", to'qimasdan aniq javob beradi va proaktiv bo'ladi.
const buildContextMessage = (ctx = {}) => {
  if (!ctx || Object.keys(ctx).length === 0) return null;
  const lines = [];
  if (ctx.subject) lines.push(`Fan: ${ctx.subject}`);
  if (ctx.topic) lines.push(`Mavzu: ${ctx.topic}`);
  if (ctx.title) lines.push(`Sahifa: ${ctx.title}`);
  if (ctx.activeItem) lines.push(`Hozir tanlangan model: ${ctx.activeItem}`);

  if (ctx.activeData && Object.keys(ctx.activeData).length) {
    lines.push("Tanlangan model haqida real ma'lumotlar (shularga asoslan):");
    lines.push(...renderActiveData(ctx.activeData));
  }

  if (Array.isArray(ctx.items) && ctx.items.length) {
    const list = ctx.items
      .slice(0, 40)
      .map((it) => (it.formula ? `${it.name} (${it.formula})` : it.name))
      .join(", ");
    lines.push(`Joriy mavzudagi mavjud modellar: ${list}`);
  }

  if (ctx.state && Object.keys(ctx.state).length) {
    const stLines = renderLabState(ctx.state);
    if (stLines.length)
      lines.push(
        `[LABORATORIYA HOLATI]\n${stLines.map((s) => `  • ${s}`).join("\n")}`,
      );
  }

  if (Array.isArray(ctx.catalog) && ctx.catalog.length) {
    const list = ctx.catalog
      .slice(0, 40)
      .map((c) => (c.formula ? `${c.name} (${c.formula})` : c.name))
      .join(", ");
    lines.push(`Mavjud reaktiv va elementlar: ${list}`);
  }

  if (Array.isArray(ctx.recentActions) && ctx.recentActions.length) {
    lines.push(`Foydalanuvchining oxirgi amallari: ${ctx.recentActions.join("; ")}`);
  }
  if (!lines.length) return null;
  return `[KONTEKST - foydalanuvchi ayni damda nimani ko'rib turibdi]\n${lines.join("\n")}`;
};

const buildMessages = (history = [], context = {}) => {
  const messages = [
    { role: "system", content: `${SYSTEM_PROMPT}\n\n${LAB_KNOWLEDGE}` },
  ];
  const ctxMsg = buildContextMessage(context);
  if (ctxMsg) messages.push({ role: "system", content: ctxMsg });

  for (const m of history) {
    if (m.role === "user" || m.role === "assistant") {
      messages.push({ role: m.role, content: String(m.content || "") });
    }
  }
  return messages;
};

// OpenAI streamini o'qiydi va onEvent({type,...}) orqali xom hodisalarni
// uzatadi: token (matn bo'lagi), tool (to'liq yig'ilgan vosita chaqiruvi).
export const streamChat = async ({ history, context }, { onEvent, signal }) => {
  const openai = getClient();
  const messages = buildMessages(history, context);

  const stream = await openai.chat.completions.create(
    {
      model: env.OPENAI_MODEL,
      messages,
      tools: AI_TOOLS,
      tool_choice: "auto",
      stream: true,
      temperature: 0.7,
      max_tokens: 700,
    },
    { signal },
  );

  // Tool-call'lar bo'lakma-bo'lak keladi; index bo'yicha yig'amiz.
  const toolCalls = new Map();

  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta;
    if (!delta) continue;

    if (delta.content) onEvent({ type: "token", value: delta.content });

    if (delta.tool_calls) {
      for (const tc of delta.tool_calls) {
        const idx = tc.index;
        const acc = toolCalls.get(idx) || { name: "", args: "" };
        if (tc.function?.name) acc.name = tc.function.name;
        if (tc.function?.arguments) acc.args += tc.function.arguments;
        toolCalls.set(idx, acc);
      }
    }
  }

  // Stream tugagach yig'ilgan vositalarni JSON sifatida chiqaramiz.
  for (const { name, args } of toolCalls.values()) {
    if (!name) continue;
    let parsed = {};
    try {
      parsed = args ? JSON.parse(args) : {};
    } catch {
      continue; // buzuq argument - o'tkazib yuboramiz
    }
    onEvent({ type: "tool", name, args: parsed });
  }
};
