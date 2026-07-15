// Gemini orqali 3D yodgorlikning bir qismini (yoki foydalanuvchi savolini)
// tanlangan daraja bo'yicha o'zbekcha tushuntiradi. API kalit faqat serverda.
import env from "../../../config/env.js";
import ApiError from "../../../utils/ApiError.js";

export const isConfigured = () => Boolean(env.GEMINI_API_KEY);

const LEVEL_HINT = {
  kids: "8-12 yoshli bolaga mos: juda sodda, hayajonli",
  school: "maktab o'quvchisiga mos: aniq va tushunarli",
  highschool: "yuqori sinf: atamalar bilan chuqurroq",
  university: "universitet: ilmiy, arxitektura atamalari bilan",
  exam: "imtihon uchun: qisqa faktlar (sana, ism, atama)",
  tourist: "sayyoh uchun: jonli, qiziqarli, 'nimaga e'tibor bering'",
};

const SYSTEM = `Sen Samarqanddagi Registon majmuasi bo'yicha bilimdon, do'stona muzey audio-gidisisan.
Foydalanuvchi 3D modelda biror qismni bosdi. Faqat O'ZBEK tilida (lotin), faqat shu qismga oid,
aniq va tarixiy faktga asoslangan javob ber. Uydirma ma'lumot berma. Javob 3-5 jumladan oshmasin.`;

const buildPrompt = ({ building, part, level, question }) => {
  const lvl = LEVEL_HINT[level] || LEVEL_HINT.tourist;
  const b = building || "Registon";
  if (question) {
    return `Foydalanuvchi ${b} majmuasidagi "${part}" qismini ko'rib turib so'radi: "${question}".\n${lvl} darajasida javob ber.`;
  }
  return `${b} majmuasidagi "${part}" qismini ${lvl} darajasida tushuntir.`;
};

const clean = (v, max) => String(v || "").replace(/\s+/g, " ").trim().slice(0, max);

export const explainPart = async ({ building, part, level, question }, { signal } = {}) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM }] },
      contents: [{ parts: [{ text: buildPrompt({ building, part, level, question }) }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 600,
        // gemini-2.5-flash "thinking" tokenlarini o'chiramiz (aks holda javob uzilib qoladi).
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
    signal,
  });

  if (res.status === 429)
    throw new ApiError(429, "AI band - biroz kutib qayta urinib ko'ring");
  if (!res.ok) throw new ApiError(502, "AI xizmatiga ulanib bo'lmadi");

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new ApiError(502, "AI bo'sh javob qaytardi");
  return { text: clean(text, 1200) };
};
