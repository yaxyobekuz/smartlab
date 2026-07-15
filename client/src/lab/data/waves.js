// Oscillation presets for the physics wave topic. Each preset just seeds the
// live sliders in WavePage — the user then changes the values and the readouts
// (period, speed) recompute from real physics.

export const WAVES = [
  {
    id: "sine",
    name: "Sinus to'lqini",
    about:
      "Sinus to'lqini - eng oddiy davriy tebranish. Amplituda balandlikni, chastota tezlikni, to'lqin uzunligi zichlikni belgilaydi.",
    type: "wave",
    amplitude: 1.2,
    frequency: 0.4,
    wavelength: 3,
  },
  {
    id: "high-frequency",
    name: "Yuqori chastota",
    about:
      "Chastota oshganda to'lqinlar tezroq tebranadi. To'lqin uzunligi qisqarsa, zichlashadi. Tezlik v = f · λ.",
    type: "wave",
    amplitude: 1,
    frequency: 0.9,
    wavelength: 1.5,
  },
  {
    id: "pendulum",
    name: "Mayatnik",
    about:
      "Mayatnik davri faqat ip uzunligiga bog'liq: T = 2π√(L/g). Massa va amplituda davrni o'zgartirmaydi.",
    type: "pendulum",
    length: 1.5,
    angle: 0.3,
  },
];

export const getWave = (id) => WAVES.find((w) => w.id === id) || null;
