import { useNavigate } from "react-router-dom";
import { ArrowRight, Headset, Sparkles } from "lucide-react";
import { SUBJECTS } from "@/lab/data/subjects";
import heroVr from "@/shared/assets/images/hero-vr.png";
import HeroBackdrop from "./HeroBackdrop";
import { PrimaryAction, SecondaryAction } from "./LandingActions";

const TOPIC_COUNT = SUBJECTS.reduce((sum, s) => sum + s.topics.length, 0);

const TRUST = [
  `${SUBJECTS.length} ta fan yo'nalishi`,
  `${TOPIC_COUNT} ta interaktiv mavzu`,
  "Ro'yxatdan o'tmasdan",
];

const HeroSection = () => {
  const navigate = useNavigate();

  // VR: laboratoriyaga ?vr=1 bilan o'tamiz - sessiyani lab sahifasidagi overlay
  // (mounted <XR> ichida, o'z bosish-gesture'ida) boshlaydi.
  const enterLabVR = () => navigate("/chemistry/lab?vr=1");

  return (
    <section className="relative isolate overflow-hidden">
      <HeroBackdrop />

      <div className="container relative grid items-center gap-10 py-16 md:grid-cols-2 md:py-24 lg:py-28">
        {/* Matn ustuni - har doim 3D qatlamdan ustun (z-[3]) */}
        <div className="relative z-[3] max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary backdrop-blur">
            <Sparkles size={14} />
            3D · VR · AI o'quv laboratoriyasi
          </span>

          <h1 className="mt-5 text-[2.6rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            Fanni o'qib emas,{" "}
            <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
              3D olamda
            </span>{" "}
            sinab o'rganing
          </h1>

          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            Smartlab — kimyo, biologiya, fizika, elektronika va tarix mavzularini
            brauzerning o'zida aylantirib, kesib va tajriba qilib o'rganadigan
            interaktiv laboratoriya. Yoningizda AI o'qituvchi, xohlasangiz VR
            ko'zoynak.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <PrimaryAction to={`/${SUBJECTS[0].slug}`} icon={ArrowRight}>
              Laboratoriyani ochish
            </PrimaryAction>
            <SecondaryAction onClick={enterLabVR} icon={Headset}>
              VR rejimda sinash
            </SecondaryAction>
          </div>

          <ul className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {TRUST.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Bola tasviri - 3D modellar uning atrofida va oldidan uchib o'tadi */}
        <div className="relative z-[1] flex h-72 items-center justify-center sm:h-80 md:h-[32rem]">
          <div className="absolute size-56 rounded-full bg-primary/25 blur-3xl md:size-80" />
          {/* Rasm to'rtburchak chekkalari fonga singib ketishi uchun yumshoq mask */}
          <img
            src={heroVr}
            alt="VR ko'zoynak kiygan o'quvchi"
            width="520"
            height="640"
            fetchPriority="high"
            className="relative h-full w-auto object-contain"
            style={{
              maskImage:
                "radial-gradient(ellipse 62% 58% at 50% 44%, black 62%, transparent 88%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 62% 58% at 50% 44%, black 62%, transparent 88%)",
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
