// Central registry: subjects (chemistry/biology/physics) -> topics.
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
        short: "Element va reaktivlarni idishga quyib reaksiyalarni kuzating.",
        icon: "TestTubes",
      },
      {
        slug: "atoms",
        title: "Atomlar",
        short: "Yadro va elektron orbitalarini kuzating.",
        icon: "Atom",
      },
    ],
  },
  {
    slug: "biology",
    title: "Biologiya",
    short: "Tirik organizm asoslari - hujayra va DNK tuzilishi.",
    icon: "Dna",
    color: "#059669",
    topics: [
      {
        slug: "cell",
        title: "Hujayra",
        short: "Hujayra organoidlari bilan tanishing.",
        icon: "Microscope",
      },
      {
        slug: "cell-studio",
        title: "Hujayra studiyasi",
        short: "7 xil hujayrani 3D da o'rganing — organoidlar, mikroskop va solishtirish.",
        icon: "Microscope",
      },
      {
        slug: "dna",
        title: "DNK spirali",
        short: "Qo'sh spiral va nukleotidlarni ko'ring.",
        icon: "Dna",
      },
      {
        slug: "anatomy",
        title: "Odam anatomiyasi",
        short: "Mushak, qon-tomir, asab, bo'g'im va ichki a'zolar tizimlarini 3D da o'rganing.",
        icon: "PersonStanding",
      },
      {
        slug: "surgery",
        title: "Jarrohlik",
        short: "Qatlamlarni yeching yoki skalpel bilan kesib ichki a'zolarni ko'ring.",
        icon: "Scissors",
      },
    ],
  },
  {
    slug: "physics",
    title: "Fizika",
    short: "Tabiat qonunlari - koinot va tebranishlarni kuzating.",
    icon: "Telescope",
    color: "#ea580c",
    topics: [
      {
        slug: "solar-system",
        title: "Quyosh tizimi",
        short: "Sayyoralarning orbitada aylanishini kuzating.",
        icon: "Orbit",
      },
      {
        slug: "wave",
        title: "To'lqin va tebranish",
        short: "Sinus to'lqini va mayatnik tebranishini ko'ring.",
        icon: "Waves",
      },
      {
        slug: "quantum-coin",
        title: "Kvant tanga tashlash",
        short: "Kvant holat va o'lchashni interaktiv PhET simulyatsiyasida o'rganing.",
        icon: "Atom",
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
];

export const getSubject = (slug) =>
  SUBJECTS.find((s) => s.slug === slug) || null;

export const getTopic = (subjectSlug, topicSlug) => {
  const subject = getSubject(subjectSlug);
  if (!subject) return null;
  return subject.topics.find((t) => t.slug === topicSlug) || null;
};
