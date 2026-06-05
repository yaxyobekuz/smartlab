// Oscillation demos for the physics wave topic.

export const WAVES = [
  {
    id: "sine",
    name: "Sinus to'lqini",
    about:
      "Sinus to'lqini — eng oddiy davriy tebranish. Amplituda balandlikni, chastota tezlikni belgilaydi.",
    type: "wave",
    amplitude: 1.2,
    frequency: 1.5,
  },
  {
    id: "high-frequency",
    name: "Yuqori chastota",
    about:
      "Chastota oshganda to'lqinlar zichlashadi va tezroq tebranadi. To'lqin uzunligi qisqaradi.",
    type: "wave",
    amplitude: 1,
    frequency: 3.5,
  },
  {
    id: "pendulum",
    name: "Mayatnik",
    about:
      "Mayatnik — og'irlik kuchi ta'sirida tebranuvchi jism. Tebranish davri ip uzunligiga bog'liq.",
    type: "pendulum",
    amplitude: 0.9,
    frequency: 1,
  },
];

export const getWave = (id) => WAVES.find((w) => w.id === id) || null;
