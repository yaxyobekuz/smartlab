import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Icon from "@/lab/components/Icon";
import { SUBJECTS } from "@/lab/data/subjects";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

const SubjectsSection = () => (
  <section id="subjects" className="container scroll-mt-20 py-16 md:py-20">
    <SectionHead
      eyebrow="Fanlar"
      title="Beshta fan — bitta laboratoriya"
      description="Har bir yo'nalish 3D sahnalar, simulyatsiyalar va AI izohlari bilan to'ldirilgan. Kartani bosib, mavzular ro'yxatini oching."
    />

    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {SUBJECTS.map((subject, i) => (
        <Reveal key={subject.slug} delay={i * 70}>
          <Link
            to={`/${subject.slug}`}
            className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            {/* hover'da ochiladigan rangli nur */}
            <div
              className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-60"
              style={{ backgroundColor: subject.color }}
            />

            <div
              className="relative grid size-14 place-items-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 motion-reduce:transition-none"
              style={{
                background: `linear-gradient(135deg, ${subject.color}26, ${subject.color}0d)`,
                boxShadow: `0 8px 24px -8px ${subject.color}66`,
              }}
            >
              <Icon name={subject.icon} size={26} style={{ color: subject.color }} />
            </div>

            <h3 className="relative mt-4 text-lg font-bold">{subject.title}</h3>
            <p className="relative mt-1 text-sm leading-relaxed text-muted-foreground">
              {subject.short}
            </p>

            <div className="relative mt-4 flex flex-wrap gap-1.5">
              {subject.topics.slice(0, 3).map((topic) => (
                <span
                  key={topic.slug}
                  className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                >
                  {topic.title}
                </span>
              ))}
              {subject.topics.length > 3 && (
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  +{subject.topics.length - 3}
                </span>
              )}
            </div>

            <div className="relative mt-auto flex items-center justify-between pt-5">
              <span className="text-xs font-medium text-muted-foreground">
                {subject.topics.length} ta mavzu
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Ochish
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                />
              </span>
            </div>
          </Link>
        </Reveal>
      ))}

      {/* Oxirgi katak: qaydan boshlashni bilmaganlar uchun yo'naltiruvchi karta */}
      <Reveal delay={SUBJECTS.length * 70}>
        <Link
          to="/chemistry/lab"
          className="group flex h-full flex-col justify-center rounded-3xl border border-dashed border-primary/35 bg-primary/5 p-6 text-center transition-colors hover:border-primary/60 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <h3 className="text-base font-bold">Qaysi biridan boshlash kerak?</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Kimyo laboratoriyasida reaktivlarni aralashtirib ko'ring — eng tez
            natija ko'rinadigan tajriba.
          </p>
          <span className="mt-4 inline-flex items-center justify-center gap-1 text-sm font-semibold text-primary">
            Laboratoriyani ochish
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
            />
          </span>
        </Link>
      </Reveal>
    </div>
  </section>
);

export default SubjectsSection;
