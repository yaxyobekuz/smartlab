import AnimatedCounter from "@/shared/components/ui/counter/AnimatedCounter";
import useMediaQuery from "@/shared/hooks/useMediaQuery";
import { SUBJECTS } from "@/lab/data/subjects";
import useReveal from "./useReveal";

const TOPIC_COUNT = SUBJECTS.reduce((sum, s) => sum + s.topics.length, 0);

const STATS = [
  { value: SUBJECTS.length, label: "Fan yo'nalishi", hint: "Kimyodan tarixgacha" },
  { value: TOPIC_COUNT, label: "Interaktiv mavzu", hint: "Har biri 3D sahnada" },
  { value: 3, label: "O'rganish rejimi", hint: "3D, VR va AI gid" },
  { value: 100, suffix: "%", label: "O'zbek tilida", hint: "Matn va AI izohlari" },
];

const StatsSection = () => {
  // Sanoq faqat bo'lim ko'ringanda boshlanadi.
  const [ref, shown] = useReveal({ threshold: 0.3 });
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return (
    <section ref={ref} className="container -mt-4 pb-4 md:pb-8">
      <div className="grid grid-cols-2 gap-3 rounded-3xl border border-border/60 bg-card/60 p-4 backdrop-blur sm:p-6 lg:grid-cols-4">
        {STATS.map(({ value, suffix, label, hint }) => (
          <div
            key={label}
            className="rounded-2xl px-4 py-3 transition-colors hover:bg-primary/5"
          >
            <p className="text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
              {shown ? (
                <AnimatedCounter
                  value={value}
                  suffix={suffix}
                  duration={reducedMotion ? 0 : 1200}
                />
              ) : (
                <span>0{suffix ?? ""}</span>
              )}
            </p>
            <p className="mt-1 text-sm font-semibold">{label}</p>
            <p className="text-xs text-muted-foreground">{hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
