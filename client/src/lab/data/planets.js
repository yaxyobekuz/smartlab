// Solar system dataset. size/distance/speed are scaled for visualization,
// real facts shown in the info panel.

export const SUN = { name: "Quyosh", color: "#fbbf24", size: 2 };

export const PLANETS = [
  {
    id: "mercury",
    name: "Merkuriy",
    color: "#a3a3a3",
    size: 0.32,
    distance: 4,
    speed: 0.048,
    about: "Quyoshga eng yaqin va eng kichik sayyora. Bir yili 88 Yer kuniga teng.",
  },
  {
    id: "venus",
    name: "Venera",
    color: "#e8a96a",
    size: 0.55,
    distance: 6,
    speed: 0.035,
    about: "Eng issiq sayyora. Qalin atmosferasi issiqlikni ushlab qoladi.",
  },
  {
    id: "earth",
    name: "Yer",
    color: "#3b82f6",
    size: 0.6,
    distance: 8.5,
    speed: 0.029,
    about: "Bizning sayyoramiz — hayot mavjud bo'lgan yagona ma'lum sayyora.",
  },
  {
    id: "mars",
    name: "Mars",
    color: "#dc2626",
    size: 0.45,
    distance: 11,
    speed: 0.024,
    about: "Qizil sayyora. Yuzasidagi temir oksidi unga qizil rang beradi.",
  },
  {
    id: "jupiter",
    name: "Yupiter",
    color: "#d6a06a",
    size: 1.3,
    distance: 15,
    speed: 0.013,
    about: "Eng katta sayyora. Mashhur 'Katta qizil dog'i' ulkan bo'rondir.",
  },
  {
    id: "saturn",
    name: "Saturn",
    color: "#e3c87a",
    size: 1.1,
    distance: 19,
    speed: 0.009,
    about: "Halqalari bilan mashhur. Halqalar muz va tosh bo'laklaridan iborat.",
    ring: true,
  },
];

export const getPlanet = (id) => PLANETS.find((p) => p.id === id) || null;
