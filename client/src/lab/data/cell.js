// Animal cell organelles for the biology cell viewer.
// pos and size are arbitrary visualization units inside the cell membrane.

export const ORGANELLES = [
  {
    id: "nucleus",
    name: "Yadro",
    color: "#7c3aed",
    pos: [0, 0, 0],
    size: 0.9,
    about: "Hujayraning boshqaruv markazi. DNK shu yerda saqlanadi.",
  },
  {
    id: "mitochondria",
    name: "Mitoxondriya",
    color: "#ef4444",
    pos: [1.6, 0.6, 0.4],
    size: 0.45,
    about: "Hujayra 'energiya stansiyasi'. ATP energiya ishlab chiqaradi.",
  },
  {
    id: "ribosome",
    name: "Ribosoma",
    color: "#f59e0b",
    pos: [-1.5, 0.8, -0.5],
    size: 0.22,
    about: "Oqsil sintez qiladi. Hujayradagi eng kichik organoidlardan biri.",
  },
  {
    id: "vacuole",
    name: "Vakuola",
    color: "#38bdf8",
    pos: [-1.2, -1, 0.6],
    size: 0.6,
    about: "Suv va oziq moddalarni saqlovchi bo'shliq.",
  },
  {
    id: "golgi",
    name: "Goldji apparati",
    color: "#10b981",
    pos: [1.3, -1.1, -0.3],
    size: 0.5,
    about: "Moddalarni qadoqlaydi va hujayra ichida tashiydi.",
  },
];

export const getOrganelle = (id) =>
  ORGANELLES.find((o) => o.id === id) || null;
