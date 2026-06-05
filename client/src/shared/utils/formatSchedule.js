export const DAY_LABELS_UZ = Object.freeze({
  mon: "Du",
  tue: "Se",
  wed: "Ch",
  thu: "Pa",
  fri: "Ju",
  sat: "Sh",
  sun: "Ya",
});

export const DAY_LABELS_FULL_UZ = Object.freeze({
  mon: "Dushanba",
  tue: "Seshanba",
  wed: "Chorshanba",
  thu: "Payshanba",
  fri: "Juma",
  sat: "Shanba",
  sun: "Yakshanba",
});

export const DAY_OPTIONS = Object.entries(DAY_LABELS_FULL_UZ).map(
  ([value, label]) => ({ value, label }),
);

export const formatSchedule = (schedule = []) => {
  if (!Array.isArray(schedule) || schedule.length === 0) return "-";
  return schedule
    .map((s) => `${DAY_LABELS_UZ[s.day] || s.day} ${s.startTime}–${s.endTime}`)
    .join(", ");
};
