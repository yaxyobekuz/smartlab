import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/lab/data/categories";

// Lazy so Three.js stays out of the initial bundle.
const HeroScene = lazy(() => import("@/lab/components/HeroScene"));

const LandingPage = () => (
  <div>
    <section className="container grid items-center gap-8 py-12 md:grid-cols-2 md:py-16">
      <div>
        <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
          Interaktiv 3D laboratoriya
        </span>
        <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
          Fanni <span className="text-primary">3D</span> olamida o'rganing
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          Smartlab — molekulalar, atomlar, sayyoralar va geometrik shakllarni
          aylantirib, bosib va o'rganib ko'rishingiz mumkin bo'lgan virtual
          laboratoriya.
        </p>
        <Link
          to={`/${CATEGORIES[0].slug}`}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Laboratoriyani ochish <ArrowRight size={16} />
        </Link>
      </div>

      <div className="h-72 md:h-96">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </div>
    </section>

    <section className="container pb-16">
      <h2 className="section-title mb-4">Yo'nalishlar</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            to={`/${c.slug}`}
            className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div
              className="grid size-12 place-items-center rounded-xl text-2xl"
              style={{ backgroundColor: `${c.color}1a` }}
            >
              {c.icon}
            </div>
            <h3 className="mt-3 font-semibold">{c.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.short}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Ko'rish
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        ))}
      </div>
    </section>
  </div>
);

export default LandingPage;
