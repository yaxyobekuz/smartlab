export const TITLE = "Kimyo laboratoriyasi";
export const SUBTITLE =
  "Haqiqiy laboratoriya xonasida yuring, jihozlarni yaqindan ko'ring va tajribalar o'tkazing.";
export const BACK_LABEL = "Kimyo";
export const BACK_TO = "/chemistry";
export const CLASSIC_TO = "/chemistry/lab";

export const CONTROLS = [
  { keys: ["W", "A", "S", "D"], label: "Yurish" },
  { keys: ["Shift"], label: "Yugurish" },
  { keys: ["Sichqoncha"], label: "Atrofga qarash" },
  { keys: ["Esc"], label: "Menyu" },
];

export const QUALITY_OPTIONS = [
  { id: "high", label: "Yuqori", hint: "Kuchli kompyuterlar uchun" },
  { id: "low", label: "Past", hint: "Maktab kompyuterlari uchun" },
];

export const TEXT = {
  enter: "Kirish",
  loading: "Laboratoriya yuklanmoqda",
  quality: "Grafika sifati",
  recommended: "tavsiya",
  controls: "Boshqaruv",
  pauseTitle: "Pauza",
  resume: "Davom etish",
  qualityMenu: "Sifat",
  reset: "Laboratoriyani tiklash",
  resetDone: "Laboratoriya boshlang'ich holatga qaytdi",
  exit: "Chiqish",
  back: "Orqaga",
  sensitivity: "Sichqoncha sezgirligi",
  showFps: "Kadr tezligini ko'rsatish",
  reduceMotion: "Miltillash va silkinishni kamaytirish",
  lockHint: "Davom etish uchun ekranni bosing",
  dragHint: "Atrofga qarash uchun sichqonchani bosib turib torting · Esc - menyu",
  fpsUnit: "kadr/s",
  placeholder: "Xona modeli hali tayyor emas - vaqtinchalik xona ko'rsatilmoqda",
};

export const DEVICE_NOTICE = {
  touch: {
    title: "Bu laboratoriya kompyuterda ishlaydi",
    text: "Yurish va tajriba uchun klaviatura va sichqoncha kerak. Telefon yoki VR ko'zoynakda oddiy laboratoriyani oching.",
  },
  webgl: {
    title: "Brauzeringiz 3D grafikani qo'llab-quvvatlamaydi",
    text: "Chrome, Edge, Yandex yoki Firefox brauzerining yangi versiyasini o'rnating yoki oddiy laboratoriyani oching.",
  },
  classic: "Oddiy laboratoriyani ochish",
  back: "Kimyo bo'limiga qaytish",
};
