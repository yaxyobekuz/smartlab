// Molecule datasets for the ball-and-stick 3D viewer.
// positions are in arbitrary units, color is per element (CPK-like).

const EL = {
  H: { color: "#e5e7eb", radius: 0.32, name: "Vodorod" },
  O: { color: "#ef4444", radius: 0.55, name: "Kislorod" },
  C: { color: "#374151", radius: 0.55, name: "Uglerod" },
  N: { color: "#3b82f6", radius: 0.52, name: "Azot" },
};

export const ELEMENTS = EL;

export const MOLECULES = [
  {
    id: "water",
    name: "Suv",
    formula: "H₂O",
    about:
      "Suv — eng muhim birikma. Bir kislorod va ikki vodorod atomidan iborat, burchakli shaklga ega.",
    atoms: [
      { el: "O", pos: [0, 0, 0] },
      { el: "H", pos: [0.76, 0.59, 0] },
      { el: "H", pos: [-0.76, 0.59, 0] },
    ],
    bonds: [
      [0, 1],
      [0, 2],
    ],
  },
  {
    id: "co2",
    name: "Karbonat angidrid",
    formula: "CO₂",
    about:
      "Karbonat angidrid — chiziqli molekula. Markazda uglerod, ikki tomonida ikki kislorod joylashgan.",
    atoms: [
      { el: "C", pos: [0, 0, 0] },
      { el: "O", pos: [1.16, 0, 0] },
      { el: "O", pos: [-1.16, 0, 0] },
    ],
    bonds: [
      [0, 1],
      [0, 2],
    ],
  },
  {
    id: "methane",
    name: "Metan",
    formula: "CH₄",
    about:
      "Metan — tabiiy gazning asosiy qismi. Uglerod atrofida to'rt vodorod tetraedr shaklida joylashgan.",
    atoms: [
      { el: "C", pos: [0, 0, 0] },
      { el: "H", pos: [0.63, 0.63, 0.63] },
      { el: "H", pos: [-0.63, -0.63, 0.63] },
      { el: "H", pos: [-0.63, 0.63, -0.63] },
      { el: "H", pos: [0.63, -0.63, -0.63] },
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
    ],
  },
  {
    id: "ammonia",
    name: "Ammiak",
    formula: "NH₃",
    about:
      "Ammiak — azot va uch vodoroddan iborat. Piramidasimon shaklga ega va o'tkir hidli gaz.",
    atoms: [
      { el: "N", pos: [0, 0, 0] },
      { el: "H", pos: [0.94, 0.3, 0] },
      { el: "H", pos: [-0.47, 0.3, 0.81] },
      { el: "H", pos: [-0.47, 0.3, -0.81] },
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [0, 3],
    ],
  },
];

export const getMolecule = (id) => MOLECULES.find((m) => m.id === id) || null;
