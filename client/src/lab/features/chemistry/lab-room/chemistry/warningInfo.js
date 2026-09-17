// Safety pop-ups for `warning` events (doc 15 § 3.5). danger: past | o'rta | yuqori
export const WARNING_INFO = {
  "water-into-acid": {
    title: "Suvni kislotaga quymang!",
    text: "Suv kislota ustida qoladi va chegarada bir zumda qaynaydi — kislota sachraydi, idish yorilishi mumkin. Qoida: kislotani suvga, ingichka oqim bilan va aralashtirib quying.",
    danger: "yuqori",
  },
  "toxic-outside-hood": {
    title: "Zaharli gaz mo'rili shkafdan tashqarida",
    text: "Bu reaksiyada zaharli gaz ajralmoqda (SO₂, NO₂, Cl₂, H₂S yoki ammiak). Idishni mo'rili shkafga qo'ying, hidni to'g'ridan-to'g'ri hidlamang — faqat qo'l bilan yelpib aniqlang.",
    danger: "yuqori",
  },
  "sodium-narrow": {
    title: "Natriy tor idishda",
    text: "Probirka yoki stakanda natriy issiqlik va vodorodni to'plab yuboradi: sachrash va portlash xavfi bor. Natriy bilan faqat keng kristallizatorda, kichik bo'lak bilan ishlanadi.",
    danger: "yuqori",
  },
  "dangerous-mix": {
    title: "Juda xavfli aralashma — maktabda bajarilmaydi",
    text: "Bu moddalarni birga qo'shish portlash yoki o'z-o'zidan alangalanishga olib keladi (masalan KMnO₄ + kons. H₂SO₄, natriy + kislota, organik modda + kons. HNO₃, H₂ + Cl₂). Simulyatsiya faqat oqibatini ko'rsatadi.",
    danger: "yuqori",
  },
  "hydrogen-impure": {
    title: "Vodorod toza emas",
    text: "Havo aralashgan vodorod baland, chiyillagan ovoz bilan portlaydi. Naycha uchida yoqishdan oldin vodorodning tozaligi probirka hajmida tekshiriladi.",
    danger: "o'rta",
  },
  "concentrated-acid-heat": {
    title: "Konsentrlangan kislota qizdirilmoqda",
    text: "Qaynoq konsentrlangan kislota sachraydi va zaharli gaz beradi. Mo'rili shkafda, ko'zoynak va qo'lqopda ishlang; issiq aralashmaga suv quymang.",
    danger: "yuqori",
  },
  "hot-glass": {
    title: "Idish juda qizigan",
    text: "Shisha issiqligini ko'rsatmaydi. Qisqich yoki probirka ushlagichdan foydalaning, issiq idishni sovuq yuzaga yoki suvga qo'ymang — yorilib ketadi.",
    danger: "o'rta",
  },
  "open-flame": {
    title: "Ochiq alanga bilan ishlamoqdasiz",
    text: "Yonuvchan suyuqliklar (spirt, glitserin) va qog'ozni alangadan uzoqqa olib qo'ying, sochni yig'ing. O'chirish uchun plastinka yoki o't o'chirgich tayyor tursin.",
    danger: "o'rta",
  },
};
