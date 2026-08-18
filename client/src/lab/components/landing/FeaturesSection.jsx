import {
  Boxes,
  Bot,
  Headset,
  Languages,
  MonitorSmartphone,
  Waypoints,
} from "lucide-react";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

const FEATURES = [
  {
    icon: Boxes,
    title: "3D interaktiv modellar",
    text: "Molekula, hujayra, anatomiya va sayyoralarni aylantiring, kattalashtiring va ichidan ko'ring.",
  },
  {
    icon: Waypoints,
    title: "Haqiqiy simulyatsiyalar",
    text: "Reaksiya, pH, gaz qonunlari va elektron sxemalar fizik-kimyoviy qoidalar asosida hisoblanadi.",
  },
  {
    icon: Bot,
    title: "AI o'qituvchi",
    text: "Mavzu kontekstini biladigan sun'iy intellekt savolingizga o'sha sahnaning o'zida javob beradi.",
  },
  {
    icon: Headset,
    title: "VR va WebXR",
    text: "Telefon uchun Cardboard yoki Quest ko'zoynagi — laboratoriyaga ichkaridan kiring.",
  },
  {
    icon: Languages,
    title: "To'liq o'zbek tilida",
    text: "Barcha mavzular, atamalar va AI izohlari o'zbek tilida tayyorlangan.",
  },
  {
    icon: MonitorSmartphone,
    title: "Brauzerda ishlaydi",
    text: "O'rnatish va ro'yxatdan o'tish shart emas — havolani ochish kifoya, telefonda ham ishlaydi.",
  },
];

const FeaturesSection = () => (
  <section className="relative overflow-hidden py-16 md:py-20">
    <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-72 -translate-y-1/2 bg-primary/5 blur-3xl" />

    <div className="container">
      <SectionHead
        centered
        eyebrow="Imkoniyatlar"
        title="O'qish emas — boshdan kechirish"
        description="Smartlab darslikdagi rasmni jonli tajribaga aylantiradi: ko'ring, o'zgartiring, natijani kuzating."
      />

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: FeatureIcon, title, text }, i) => (
          <Reveal
            key={title}
            delay={i * 60}
            className="group h-full rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur transition-colors duration-300 hover:border-primary/40 motion-reduce:transition-none"
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none">
              <FeatureIcon size={22} />
            </span>
            <h3 className="mt-4 text-base font-bold">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {text}
            </p>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
