export const formatDateUZ = (date, options = {}) => {
  const dateObj = new Date(date);

  const months = [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    "sentabr",
    "oktabr",
    "noyabr",
    "dekabr",
  ];

  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  if (options.hideYear) {
    return `${day}-${month}`;
  }

  return `${day}-${month}, ${year}`;
};

export const formatDateUZAlt = (date) => {
  const dateObj = new Date(date);

  const months = [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    "sentabr",
    "oktabr",
    "noyabr",
    "dekabr",
  ];

  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${day} ${month}, ${year}`;
};

export const getDayOfWeekUZ = (date) => {
  const dateObj = new Date(date);
  const daysUz = [
    "yakshanba",
    "dushanba",
    "seshanba",
    "chorshanba",
    "payshanba",
    "juma",
    "shanba",
  ];
  return daysUz[dateObj.getDay()];
};

export const months = [
  { label: "Yanvar", value: 0 },
  { label: "Fevral", value: 1 },
  { label: "Mart", value: 2 },
  { label: "Aprel", value: 3 },
  { label: "May", value: 4 },
  { label: "Iyun", value: 5 },
  { label: "Iyul", value: 6 },
  { label: "Avgust", value: 7 },
  { label: "Sentabr", value: 8 },
  { label: "Oktabr", value: 9 },
  { label: "Noyabr", value: 10 },
  { label: "Dekabr", value: 11 },
];
