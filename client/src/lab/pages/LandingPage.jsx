import { lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Headset } from "lucide-react";
import Icon from "@/lab/components/Icon";
import { SUBJECTS } from "@/lab/data/subjects";
import heroVr from "@/shared/assets/images/hero-vr.png";

// Three.js bosh sahifa bundle'ini og'irlashtirmasin - lazy yuklanadi.
const HeroFloatingScene = lazy(() => import("@/lab/components/HeroFloatingScene"));

const LandingPage = () => {
  const navigate = useNavigate();

  // VR: shunchaki laboratoriyaga ?vr=1 bilan o'tamiz. Sessiyani lab sahifasidagi
  // overlay (mounted <XR> ichida, o'z bosish-gesture'ida) boshlaydi. Bu yerda
  // enterVR() chaqirsak, Canvas hali mavjud emasligi uchun u baribir rad etiladi.
  const enterLabVR = () => navigate("/chemistry/lab?vr=1");

  return (
  <div>
    {/* HERO - 3D gamefication uslubi: butun kenglikda suzuvchi 3D fan modellari
        bolani o'rab aylanadi (Canvas hero'ning to'liq eniga yoyilgan - qirqilmaydi),
        ustida gradient orbit'lar, glassy matn kartasi va yorug'lik effektlari. */}
    <section className="relative overflow-hidden">
      {/* Fon nur/gradient qatlamlari (gamified muhit) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-10 size-[38rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-[10%] top-1/3 size-72 rounded-full bg-fuchsia-500/20 blur-[90px]" />
        <div className="absolute left-[8%] bottom-0 size-72 rounded-full bg-indigo-500/20 blur-[90px]" />
        {/* nozik to'r (grid) - 3D fazo hissi */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent)",
          }}
        />
      </div>

      {/* 3D modellar - butun hero section eni bo'ylab, bola OLDIDA/atrofida erkin
          suzadi (z-20 = rasmdan ustun, shu sabab bolani o'rab, oldidan uchib
          o'tgandek ko'rinadi - orqasida qolib ketmaydi). */}
      <div className="pointer-events-none absolute inset-0 z-20">
        <Suspense fallback={null}>
          <HeroFloatingScene />
        </Suspense>
      </div>

      <div className="container relative z-10 grid items-center gap-8 py-16 md:grid-cols-2 md:py-24">
        <div className="relative">
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            Fanni{" "}
            <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
              3D
            </span>{" "}
            olamida o'rganing
          </h1>
          <p className="mt-4 max-w-md text-base text-muted-foreground md:text-lg">
            Smartlab - kimyo, biologiya va fizika hodisalarini aylantirib, bosib
            va o'rganib ko'rishingiz mumkin bo'lgan virtual laboratoriya.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            {/* 3D button: asos (to'q qatlam) tepasida ko'tarilgan yuza; hover'da
                balandroq ko'tariladi, bosilganda "botadi" (translate-y + soya). */}
            <Link
              to={`/${SUBJECTS[0].slug}`}
              className="group relative inline-block rounded-2xl bg-purple-800 pb-1.5 shadow-[0_6px_0_0_theme(colors.purple.900)] transition-all duration-150 hover:pb-2 hover:shadow-[0_8px_0_0_theme(colors.purple.900)] active:translate-y-1.5 active:pb-0 active:shadow-[0_1px_0_0_theme(colors.purple.900)]"
            >
              <span className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 px-7 py-3.5 text-sm font-bold text-white">
                Laboratoriyani ochish
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <button
              type="button"
              onClick={enterLabVR}
              className="group relative inline-block rounded-2xl bg-primary/20 pb-1.5 shadow-[0_6px_0_0_theme(colors.violet.300)] transition-all duration-150 hover:pb-2 hover:shadow-[0_8px_0_0_theme(colors.violet.300)] active:translate-y-1.5 active:pb-0 active:shadow-[0_1px_0_0_theme(colors.violet.300)] dark:shadow-[0_6px_0_0_theme(colors.violet.800)] dark:hover:shadow-[0_8px_0_0_theme(colors.violet.800)] dark:active:shadow-[0_1px_0_0_theme(colors.violet.800)]"
            >
              <span className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-background px-7 py-3.5 text-sm font-bold text-primary">
                <Headset size={16} /> VR laboratoriyaga kirish
              </span>
            </button>
          </div>
        </div>

        {/* Bola rasmi - modellar markazi (Canvas orqada, butun sectionda). */}
        <div className="relative flex h-80 items-center justify-center md:h-[32rem]">
          <img
            src={heroVr}
            alt="VR ko'zoynak kiygan bola"
            className="relative z-10 h-full w-auto object-contain drop-shadow-2xl"
            style={{ filter: "drop-shadow(0 25px 50px hsl(var(--primary) / 0.35))" }}
          />
        </div>
      </div>
    </section>

    <section className="container relative pb-20">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">Fanlar</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Bosib kirib, 3D olamni kashf eting
          </p>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SUBJECTS.map((s) => (
          <Link
            key={s.slug}
            to={`/${s.slug}`}
            className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/20"
          >
            {/* hover'da ochiladigan gradient nur (gamified chuqurlik) */}
            <div
              className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-60"
              style={{ backgroundColor: s.color }}
            />
            <div
              className="relative grid size-14 place-items-center rounded-2xl shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
              style={{
                background: `linear-gradient(135deg, ${s.color}26, ${s.color}0d)`,
                boxShadow: `0 8px 24px -8px ${s.color}66`,
              }}
            >
              <Icon name={s.icon} size={26} style={{ color: s.color }} />
            </div>
            <h3 className="relative mt-4 text-lg font-bold">{s.title}</h3>
            <p className="relative mt-1 text-sm text-muted-foreground">{s.short}</p>
            <div className="relative mt-4 flex items-center justify-between">
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {s.topics.length} ta mavzu
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Ochish
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  </div>
  );
};

export default LandingPage;
