// 3D geometry shapes with volume/surface formulas. `kind` maps to a drei geometry.

export const SHAPES = [
  {
    id: "cube",
    name: "Kub",
    kind: "box",
    color: "#059669",
    volume: "V = a³",
    surface: "S = 6a²",
    about: "Olti kvadrat yoqdan iborat to'g'ri burchakli jism. Barcha qirralari teng.",
  },
  {
    id: "sphere",
    name: "Shar",
    kind: "sphere",
    color: "#2563eb",
    volume: "V = (4/3)πr³",
    surface: "S = 4πr²",
    about: "Markazdan barcha nuqtalargacha masofa teng bo'lgan jism.",
  },
  {
    id: "cylinder",
    name: "Silindr",
    kind: "cylinder",
    color: "#ea580c",
    volume: "V = πr²h",
    surface: "S = 2πr(r + h)",
    about: "Ikki teng aylana asos va ularni tutashtiruvchi yon yuzadan iborat.",
  },
  {
    id: "cone",
    name: "Konus",
    kind: "cone",
    color: "#7c3aed",
    volume: "V = (1/3)πr²h",
    surface: "S = πr(r + l)",
    about: "Aylana asos va bir uchga yig'iladigan yon yuzadan iborat.",
  },
  {
    id: "pyramid",
    name: "Piramida",
    kind: "pyramid",
    color: "#dc2626",
    volume: "V = (1/3)·S_asos·h",
    surface: "S = S_asos + S_yon",
    about: "Ko'pburchak asos va bir cho'qqiga yig'iladigan uchburchak yoqlardan iborat.",
  },
];

export const getShape = (id) => SHAPES.find((s) => s.id === id) || null;
