import { objectType } from "./objectTypes";

const LMB = "Chap tugma";

export const displayName = (typeId) => {
  const type = objectType(typeId);
  if (!type) return "";
  return type.kind === "substance" ? `${type.name} · ${type.substance.formula}` : type.name;
};

export const PROMPTS = {
  reasons: {
    surface: "Bu yerga qo'yib bo'lmaydi",
    support: "Bu narsaning ustiga qo'yib bo'lmaydi",
    blocked: "Bu joy band",
    far: "Qo'yish uchun stolga yaqinroq qarang",
    occupied: "Avval ustidagi narsani oling",
    full: "Barcha 5 joy band: avval biror narsani qo'ying",
  },

  holding: (held, placement) => {
    const reason = placement ? placement.reason : "far";
    const actions = [
      { keys: [LMB], label: placement?.valid ? "Qo'yish" : PROMPTS.reasons[reason], disabled: !placement?.valid },
      { keys: ["G"], label: "Tashlash" },
    ];
    return { key: `hold:${held.id}:${placement?.valid ?? "none"}:${reason}`, title: displayName(held.typeId), actions };
  },

  focus: (object) =>
    object && {
      key: `focus:${object.id}`,
      title: displayName(object.typeId),
      actions: [{ keys: [LMB], label: "Olish" }],
    },
};
