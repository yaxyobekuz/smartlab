// Gemini orqali ikki moddaning (miqdori bilan) reaksiyasini aniqlaydi va
// frontend biladigan "status" kalitini qaytaradi. API kalit faqat serverda.
import env from "../../../config/env.js";
import ApiError from "../../../utils/ApiError.js";

export const isConfigured = () => Boolean(env.GEMINI_API_KEY);

// Frontend'dagi reactions.js STATUS_INFO bilan bir xil status lug'ati.
export const STATUS_KEYS = [
  "portlash",
  "yonish",
  "tutun",
  "qaynash",
  "pufaklanish",
  "rang_ozgarishi",
  "chokma",
  "gaz_ajralishi",
  "issiqlik",
  "tuman",
  "neytral",
];

const SYSTEM_INSTRUCTION = `Sen kimyo laboratoriyasi reaksiya simulyatorisisan.
Senga ikkita modda va ularning miqdori beriladi. Ular aralashganda nima
sodir bo'lishini aniqla. Molyar nisbat (stoikiometriya)ni hisobga ol - masalan
katta bo'lak natriyga bir tomchi suv portlash, ozgina natriyga bir chelak suv
esa kuchsiz reaksiya beradi.
Faqat quyidagi status'lardan BIRINI tanla (boshqasini o'ylab topma):
portlash, yonish, tutun, qaynash, pufaklanish, rang_ozgarishi, chokma,
gaz_ajralishi, issiqlik, tuman, neytral.
Agar sezilarli reaksiya bo'lmasa - "neytral".
description: bitta qisqa o'zbekcha jumla.
equation: bitta qatorli kimyoviy tenglama (masalan "2H2 + O2 -> 2H2O") -
bo'sh joy yoki belgini takrorlama.
intensity: 1..10 (reaksiya kuchi).`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    status: { type: "STRING", enum: STATUS_KEYS },
    intensity: { type: "INTEGER" },
    description: { type: "STRING" },
    equation: { type: "STRING" },
  },
  required: ["status", "intensity", "description"],
  propertyOrdering: ["status", "intensity", "description", "equation"],
};

const reagentLine = (r) =>
  `${r.quantity} ${r.unit || "g"} ${r.name}${r.formula ? ` (${r.formula})` : ""}`;

const buildPrompt = ({ a, b }) =>
  `A modda: ${reagentLine(a)}\nB modda: ${reagentLine(b)}\nBu ikkalasini aralashtirsak nima bo'ladi?`;

// Bo'sh joy takrorini yig'ib, matnni tozalaydi (model ba'zan tab/probel
// takrorlashiga tushib qoladi - shuni zararsizlantiradi).
const clean = (v, max) => String(v || "").replace(/\s+/g, " ").trim().slice(0, max);

// AI javobini xavfsiz ko'rinishga keltiradi: status ro'yxatda bo'lmasa yoki
// javob buzuq bo'lsa - neytral, intensity 1..10 ga qisiladi.
const normalize = (raw) => {
  const status = STATUS_KEYS.includes(raw?.status) ? raw.status : "neytral";
  let intensity = Number(raw?.intensity);
  if (!Number.isFinite(intensity)) intensity = status === "neytral" ? 1 : 5;
  intensity = Math.min(10, Math.max(1, Math.round(intensity)));
  const equation = clean(raw?.equation, 120);
  return {
    status,
    intensity,
    description: clean(raw?.description, 400),
    equation: equation || null,
  };
};

export const analyzeReaction = async ({ a, b }, { signal } = {}) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: [{ parts: [{ text: buildPrompt({ a, b }) }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.2,
        maxOutputTokens: 800,
        // Flash "thinking" modeli - o'ylash tokenlarini o'chiramiz, aks holda
        // ular chiqish budjetini yeb, JSON yarim uzilib qoladi.
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
    signal,
  });

  if (res.status === 429)
    throw new ApiError(429, "AI band - biroz kutib qayta urinib ko'ring");
  if (!res.ok) throw new ApiError(502, "AI reaksiya xizmatiga ulanib bo'lmadi");

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new ApiError(502, "AI bo'sh javob qaytardi");

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ApiError(502, "AI javobini o'qib bo'lmadi");
  }
  return normalize(parsed);
};
