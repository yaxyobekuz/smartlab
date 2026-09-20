// Central registry: subjects -> topics. Every subject now lives in LearnStuff.
// `slug` values are URL params: /:subject and /:subject/:topic.
// UI text in Uzbek, code values in English.

export const SUBJECTS = [
];

export const getSubject = (slug) =>
  SUBJECTS.find((s) => s.slug === slug) || null;

export const getTopic = (subjectSlug, topicSlug) => {
  const subject = getSubject(subjectSlug);
  if (!subject) return null;
  return subject.topics.find((t) => t.slug === topicSlug) || null;
};
