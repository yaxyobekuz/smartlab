// Central registry: subjects (chemistry/biology/physics) -> topics.
// `slug` values are URL params: /:subject and /:subject/:topic.
// UI text in Uzbek, code values in English.

export const SUBJECTS = [
  {
    slug: "chemistry",
    title: "Kimyo",
    short: "Modda tuzilishi - molekula va atomlarni 3D da o'rganing.",
    icon: "🧪",
    color: "#2563eb",
    topics: [
      {
        slug: "molecules",
        title: "Molekulalar",
        short: "Suv, CO₂, metan kabi birikmalarni aylantirib ko'ring.",
        icon: "🧬",
      },
      {
        slug: "lab",
        title: "Interaktiv laboratoriya",
        short: "Element va reaktivlarni idishga quyib reaksiyalarni kuzating.",
        icon: "⚗️",
      },
      {
        slug: "atoms",
        title: "Atomlar",
        short: "Yadro va elektron orbitalarini kuzating.",
        icon: "⚛️",
      },
    ],
  },
  {
    slug: "biology",
    title: "Biologiya",
    short: "Tirik organizm asoslari - hujayra va DNK tuzilishi.",
    icon: "🧫",
    color: "#059669",
    topics: [
      {
        slug: "cell",
        title: "Hujayra",
        short: "Hujayra organoidlari bilan tanishing.",
        icon: "🦠",
      },
      {
        slug: "dna",
        title: "DNK spirali",
        short: "Qo'sh spiral va nukleotidlarni ko'ring.",
        icon: "🧬",
      },
    ],
  },
  {
    slug: "physics",
    title: "Fizika",
    short: "Tabiat qonunlari - koinot va tebranishlarni kuzating.",
    icon: "🔭",
    color: "#ea580c",
    topics: [
      {
        slug: "solar-system",
        title: "Quyosh tizimi",
        short: "Sayyoralarning orbitada aylanishini kuzating.",
        icon: "🪐",
      },
      {
        slug: "wave",
        title: "To'lqin va tebranish",
        short: "Sinus to'lqini va mayatnik tebranishini ko'ring.",
        icon: "〰️",
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
