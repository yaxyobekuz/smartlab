// Butun ilova bo'ylab yagona WebXR do'koni: VR sessiyani bosh sahifadagi
// tugmadan boshlab, keyin ochiladigan Canvas (masalan, laboratoriya) ichida
// render qilish uchun. Bitta sessiya, hamma joyda bir xil store.
import { createXRStore } from "@react-three/xr";

export const xrStore = createXRStore({
  // local-floor: koordinata boshi - foydalanuvchining oyog'i; ~1.6m bo'yli
  // turgan ko'z stenddagi probirkani ramkaga oladi (XROrigin Y bilan moslanadi).
  originReferenceSpace: "local-floor",
  // MUHIM: sessiyani O'ZI taklif qilib avtomatik boshlab yubormasin. Aks holda
  // localhost'da ichki emulyator sessiyani foydalanuvchi bosmasdan yoqib,
  // panellar yashirilib, ekran bo'sh ko'rinadi. VR faqat aniq "Enter VR"da boshlanadi.
  offerSession: false,
  // localhost'da ichki Quest emulyatori test uchun qoladi, lekin og'ir sintetik
  // xona (living_room/music_room ~MB) yuklanmasin - VR'da faqat laboratoriya ko'rinsin.
  emulate: { syntheticEnvironment: false },
});
