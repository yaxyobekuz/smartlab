import { FlaskConical, MousePointerClick, Sparkles } from "lucide-react";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

const STEPS = [
  {
    icon: MousePointerClick,
    title: "Fanni tanlang",
    text: "Kimyo, biologiya, fizika, elektronika yoki tarix — sizni qiziqtirgan yo'nalishni oching.",
  },
  {
    icon: FlaskConical,
    title: "Mavzuni sinab ko'ring",
    text: "3D sahnada modelni aylantiring, tajriba o'tkazing va parametrlarni o'zgartirib natijani kuzating.",
  },
  {
    icon: Sparkles,
    title: "AI dan so'rang",
    text: "Tushunmagan joyingizni o'sha sahnaning o'zida AI o'qituvchidan o'zbek tilida so'rang.",
  },
];

const ProcessSection = () => (
  <section className="container py-16 md:py-20">
    <SectionHead
      centered
      eyebrow="Qanday ishlaydi"
      title="Uch qadamda tajribaga kirishing"
      description="Ro'yxatdan o'tish, dastur o'rnatish yoki qo'shimcha jihoz shart emas."
    />

    <div className="relative mt-12 grid gap-6 md:grid-cols-3">
      {/* qadamlarni bog'lovchi chiziq (faqat desktopda) */}
      <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block" />

      {STEPS.map(({ icon: StepIcon, title, text }, i) => (
        <Reveal key={title} delay={i * 110} className="relative text-center">
          <span className="relative mx-auto grid size-14 place-items-center rounded-2xl border border-primary/25 bg-background text-primary shadow-lg shadow-primary/10">
            <StepIcon size={24} />
            <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {i + 1}
            </span>
          </span>
          <h3 className="mt-4 text-lg font-bold">{title}</h3>
          <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {text}
          </p>
        </Reveal>
      ))}
    </div>
  </section>
);

export default ProcessSection;
