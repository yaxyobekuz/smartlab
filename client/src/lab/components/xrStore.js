// Butun ilova bo'ylab yagona WebXR do'koni: VR sessiyani bosh sahifadagi
// tugmadan boshlab, keyin ochiladigan Canvas (masalan, laboratoriya) ichida
// render qilish uchun. Bitta sessiya, hamma joyda bir xil store.
import { createXRStore } from "@react-three/xr";

export const xrStore = createXRStore();
