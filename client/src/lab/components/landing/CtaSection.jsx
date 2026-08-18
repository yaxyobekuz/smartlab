import { useNavigate } from "react-router-dom";
import { ArrowRight, Headset } from "lucide-react";
import { SUBJECTS } from "@/lab/data/subjects";
import Reveal from "./Reveal";
import { PrimaryAction, SecondaryAction } from "./LandingActions";

const CtaSection = () => {
  const navigate = useNavigate();
  const enterLabVR = () => navigate("/chemistry/lab?vr=1");

  return (
    <section className="container pb-20 pt-4 md:pb-28">
      <Reveal className="relative overflow-hidden rounded-[2rem] border border-primary/25 bg-gradient-to-br from-violet-500/15 via-purple-500/10 to-fuchsia-500/15 px-6 py-14 text-center backdrop-blur md:px-16">
        <div className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 size-64 rounded-full bg-fuchsia-500/20 blur-3xl" />

        <h2 className="relative mx-auto max-w-2xl text-3xl font-extrabold tracking-tight md:text-4xl">
          Birinchi tajribangizni hoziroq boshlang
        </h2>
        <p className="relative mx-auto mt-3 max-w-xl text-base text-muted-foreground">
          Laboratoriya ochiq — hech qanday ro'yxatdan o'tish yoki to'lov talab
          qilinmaydi. Bitta bosishda 3D sahnaga kirasiz.
        </p>

        <div className="relative mt-8 flex flex-wrap justify-center gap-4">
          <PrimaryAction to={`/${SUBJECTS[0].slug}`} icon={ArrowRight}>
            Laboratoriyani ochish
          </PrimaryAction>
          <SecondaryAction onClick={enterLabVR} icon={Headset}>
            VR rejimda sinash
          </SecondaryAction>
        </div>
      </Reveal>
    </section>
  );
};

export default CtaSection;
