// Central registry: subjects (history) -> topics.
// `slug` values are URL params: /:subject and /:subject/:topic.
// UI text in Uzbek, code values in English.

export const SUBJECTS = [
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
