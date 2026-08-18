// Hero foni ikki qatlamdan iborat:
//   1) gradient nur + to'r (har doim, juda arzon)
//   2) interaktiv 3D sahna (faqat imkoni bo'lsa) yoki yengil SVG fallback
// 3D sahna bo'sh vaqtda (idle) lazy yuklanadi va ekrandan chiqqanda to'xtaydi.
import { lazy, Suspense, useEffect, useRef } from "react";
import useMediaQuery from "@/shared/hooks/useMediaQuery";
import useObjectState from "@/shared/hooks/useObjectState";

const HeroScene = lazy(() => import("./HeroScene"));

const hasWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGL2RenderingContext && canvas.getContext("webgl2"),
    ) || Boolean(window.WebGLRenderingContext && canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

// Kuchsiz qurilma: kam xotira yoki kam yadro - 3D o'rniga statik fon.
const isWeakDevice = () =>
  (navigator.deviceMemory && navigator.deviceMemory <= 2) ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);

const runWhenIdle = (fn) =>
  typeof requestIdleCallback === "function"
    ? requestIdleCallback(fn, { timeout: 1200 })
    : setTimeout(fn, 400);

const cancelIdle = (id) =>
  typeof cancelIdleCallback === "function" ? cancelIdleCallback(id) : clearTimeout(id);

const GlowLayer = () => (
  <div className="absolute inset-0 z-0 overflow-hidden">
    <div className="absolute left-1/2 top-0 size-[42rem] -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary/20 blur-[130px]" />
    <div className="absolute right-[6%] top-1/4 size-80 rounded-full bg-fuchsia-500/20 blur-[100px]" />
    <div className="absolute bottom-0 left-[4%] size-80 rounded-full bg-indigo-500/20 blur-[100px]" />
    {/* nozik to'r - 3D fazo hissi */}
    <div
      className="absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage:
          "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
        maskImage: "radial-gradient(ellipse 80% 62% at 50% 42%, black, transparent)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 62% at 50% 42%, black, transparent)",
      }}
    />
  </div>
);

// WebGL yo'q / harakat kamaytirilgan holat uchun yengil SVG muqobil.
const StaticShapes = () => (
  <div className="absolute inset-0 overflow-hidden">
    <svg
      className="absolute right-[6%] top-10 size-40 text-primary/25 motion-safe:animate-float-y md:size-56"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="50" cy="50" r="8" fill="currentColor" stroke="none" />
      <ellipse cx="50" cy="50" rx="42" ry="16" />
      <ellipse cx="50" cy="50" rx="42" ry="16" transform="rotate(60 50 50)" />
      <ellipse cx="50" cy="50" rx="42" ry="16" transform="rotate(120 50 50)" />
    </svg>
    <svg
      className="absolute right-[32%] top-[60%] hidden size-24 text-fuchsia-500/25 motion-safe:animate-drift sm:block md:size-32"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="50" cy="20" r="10" fill="currentColor" stroke="none" />
      <circle cx="22" cy="70" r="8" fill="currentColor" stroke="none" />
      <circle cx="78" cy="70" r="8" fill="currentColor" stroke="none" />
      <path d="M50 20 22 70M50 20l28 50M22 70h56" />
    </svg>
    <svg
      className="absolute bottom-8 right-[12%] size-24 text-indigo-500/25 motion-safe:animate-float-y md:size-32"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="50" cy="50" r="34" />
      <ellipse cx="50" cy="50" rx="14" ry="34" />
      <path d="M17 38h66M17 62h66" />
    </svg>
  </div>
);

const HeroBackdrop = () => {
  const wrapper = useRef(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isCompact = useMediaQuery("(max-width: 767px)");
  const { mode, active, setField } = useObjectState({
    mode: "pending",
    active: true,
  });

  // 3D'ni faqat qo'llab-quvvatlansa va sahifa bo'shashgach ulaymiz.
  useEffect(() => {
    if (reducedMotion || !hasWebGL() || isWeakDevice()) {
      setField("mode", "static");
      return;
    }

    const id = runWhenIdle(() => setField("mode", "scene"));
    return () => cancelIdle(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  // Ekrandan chiqqanda yoki tab yashirilganda render'ni to'xtatamiz.
  useEffect(() => {
    if (mode !== "scene") return;

    const el = wrapper.current;
    let visible = true;

    const sync = () => setField("active", visible && !document.hidden);
    const observer =
      typeof IntersectionObserver !== "undefined" && el
        ? new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            sync();
          })
        : null;

    observer?.observe(el);
    document.addEventListener("visibilitychange", sync);

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <>
      <GlowLayer />
      <div
        ref={wrapper}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2]"
      >
        {mode === "scene" && (
          <Suspense fallback={null}>
            <HeroScene active={active} low={isCompact} />
          </Suspense>
        )}
        {mode === "static" && <StaticShapes />}
      </div>
    </>
  );
};

export default HeroBackdrop;
