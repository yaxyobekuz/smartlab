// Central registry of all lab categories. `slug` is the URL param (/:category).
// UI text in Uzbek, code values in English.

export const CATEGORIES = [
  {
    slug: "molecules",
    title: "Molekulalar",
    short: "Atomlardan tashkil topgan birikmalarni 3D ko'rinishda o'rganing.",
    icon: "🧪",
    color: "#2563eb",
  },
  {
    slug: "atoms",
    title: "Atomlar",
    short: "Yadro, proton, neytron va elektron orbitalarini ko'rib chiqing.",
    icon: "⚛️",
    color: "#7c3aed",
  },
  {
    slug: "solar-system",
    title: "Quyosh tizimi",
    short: "Sayyoralarning orbitada aylanishini real vaqtda kuzating.",
    icon: "🪐",
    color: "#ea580c",
  },
  {
    slug: "geometry",
    title: "Geometrik shakllar",
    short: "Hajmli figuralar bilan tanishing, hajm va yuza formulalarini ko'ring.",
    icon: "📐",
    color: "#059669",
  },
];

export const getCategory = (slug) =>
  CATEGORIES.find((c) => c.slug === slug) || null;
