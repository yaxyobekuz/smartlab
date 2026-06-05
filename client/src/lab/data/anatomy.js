// Human anatomy GLB models. Each entry is a biology topic.
// `?url` import → Vite serves the asset; the file lives in shared/assets/models.
// UI text in Uzbek, slug/code values in English.
import myologyUrl from "@/shared/assets/models/myology.glb?url";
import angiologyUrl from "@/shared/assets/models/angiology.glb?url";
import neurologyUrl from "@/shared/assets/models/neurology.glb?url";
import arthrologyUrl from "@/shared/assets/models/arthrology.glb?url";
import splanchnologyUrl from "@/shared/assets/models/splanchnology.glb?url";
import muscularInsertionsUrl from "@/shared/assets/models/muscular_insertions.glb?url";

export const ANATOMY = [
  {
    slug: "myology",
    title: "Mushaklar tizimi",
    short: "Tana mushaklarining joylashuvini 3D da ko'ring.",
    icon: "💪",
    url: myologyUrl,
    about:
      "Mushaklar tizimi (miologiya) - tana harakatini ta'minlovchi skelet mushaklari. Ular suyaklarga birikib qisqarish orqali harakat hosil qiladi.",
  },
  {
    slug: "angiology",
    title: "Qon-tomir tizimi",
    short: "Arteriya va venalarning butun tanadagi tarmog'ini kuzating.",
    icon: "🩸",
    url: angiologyUrl,
    about:
      "Qon-tomir tizimi (angiologiya) - yurak, arteriyalar, venalar va kapillyarlar. Qonni butun tanaga yetkazib, kislorod va oziq moddalarni tashiydi.",
  },
  {
    slug: "neurology",
    title: "Asab tizimi",
    short: "Bosh miya, orqa miya va nervlar tarmog'ini ko'ring.",
    icon: "🧠",
    url: neurologyUrl,
    about:
      "Asab tizimi (nevrologiya) - bosh miya, orqa miya va periferik nervlar. Tana a'zolari o'rtasida signal uzatib, harakat va sezgini boshqaradi.",
  },
  {
    slug: "arthrology",
    title: "Bo'g'imlar tizimi",
    short: "Suyaklar birlashadigan bo'g'imlarni o'rganing.",
    icon: "🦴",
    url: arthrologyUrl,
    about:
      "Bo'g'imlar tizimi (artrologiya) - suyaklarni o'zaro bog'lovchi bo'g'imlar. Ular tananing egiluvchanligi va harakat doirasini belgilaydi.",
  },
  {
    slug: "splanchnology",
    title: "Ichki a'zolar",
    short: "Ko'krak va qorin bo'shlig'idagi ichki a'zolarni ko'ring.",
    icon: "🫁",
    url: splanchnologyUrl,
    about:
      "Ichki a'zolar (splanxnologiya) - yurak, o'pka, jigar, oshqozon, ichaklar va boshqa a'zolar. Nafas olish, hazm qilish va ayirish jarayonlarini bajaradi.",
  },
  {
    slug: "muscular-insertions",
    title: "Mushak birikmalari",
    short: "Mushaklarning suyaklarga birikish nuqtalarini ko'ring.",
    icon: "🔗",
    url: muscularInsertionsUrl,
    about:
      "Mushak birikmalari - mushaklarning suyaklarga boshlanish (origo) va tugash (insertio) nuqtalari. Bu birikmalar mushak qisqarganda qaysi suyak harakatlanishini belgilaydi.",
  },
];

export const getAnatomy = (slug) =>
  ANATOMY.find((a) => a.slug === slug) || null;
