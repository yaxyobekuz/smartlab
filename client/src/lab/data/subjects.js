// Central registry: subjects (chemistry/electronics/history) -> topics.
// `slug` values are URL params: /:subject and /:subject/:topic.
// UI text in Uzbek, code values in English.

export const SUBJECTS = [
  {
    slug: "chemistry",
    title: "Kimyo",
    short: "Modda tuzilishi - molekula va atomlarni 3D da o'rganing.",
    icon: "FlaskConical",
    color: "#2563eb",
    topics: [
      {
        slug: "periodic-table",
        title: "Davriy jadval",
        short: "118 element, ionlar va tenglama/molyar massa kalkulyatorlari.",
        icon: "Grid3x3",
      },
      {
        slug: "molecules",
        title: "Molekulalar",
        short: "Suv, CO₂, metan kabi birikmalarni aylantirib ko'ring.",
        icon: "Hexagon",
      },
      {
        slug: "lab",
        title: "Interaktiv laboratoriya",
        short: "Laboratoriya xonasida yuring, reaktivlarni aralashtirib reaksiyalarni kuzating.",
        icon: "TestTubes",
      },
      {
        slug: "atoms",
        title: "Atomlar",
        short: "Yadro va elektron orbitalarini kuzating.",
        icon: "Atom",
      },
      {
        slug: "ph",
        title: "pH simulyatsiya",
        short: "Eritma kuchini o'zgartirib pH va indikator rangini kuzating.",
        icon: "Droplet",
      },
      {
        slug: "gas-laws",
        title: "Gaz qonunlari",
        short: "Hajm, harorat va mol miqdorini o'zgartirib bosimni hisoblang.",
        icon: "Gauge",
      },
    ],
  },
  {
    slug: "electronics",
    title: "Elektron mehanika",
    short: "Platalar va sxemalar - Arduino bilan LED va motorlarni boshqaring.",
    icon: "CircuitBoard",
    color: "#7c3aed",
    topics: [
      {
        slug: "arduino",
        title: "Sxema quruvchi",
        short: "Komponentlarni tortib ulang, kod yozing va simulyatsiyani jonli kuzating.",
        icon: "Cpu",
      },
    ],
  },
  {
    slug: "history",
    title: "Tarix",
    short: "O'tmish yodgorliklari - Registonni 3D da AI gid bilan kashf eting.",
    icon: "Landmark",
    color: "#b5751a",
    topics: [
      {
        slug: "registan",
        title: "Registon (audio-gid)",
        short: "3D Registon: hotspotlar, sayohat, vaqt sayohati va AI gid.",
        icon: "Landmark",
      },
      {
        slug: "atlas",
        title: "Tarixiy atlas",
        short: "Vaqt jadvalini suring: qaysi davrda qaysi davlat qanday hududlarni egallaganini ko'ring.",
        icon: "Map",
      },
    ],
  },
];

export const getSubject = (slug) =>
  SUBJECTS.find((s) => s.slug === slug) || null;

export const getTopic = (subjectSlug, topicSlug) => {
  const subject = getSubject(subjectSlug);
  if (!subject) return null;
  return subject.topics.find((t) => t.slug === topicSlug) || null;
};
