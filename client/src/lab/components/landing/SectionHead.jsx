import { cn } from "@/shared/utils/cn";
import Reveal from "./Reveal";

// Bo'lim sarlavhasi: kichik yorliq + sarlavha + izoh.
const SectionHead = ({ eyebrow, title, description, centered = false, className }) => (
  <Reveal className={cn("max-w-2xl", centered && "mx-auto text-center", className)}>
    {eyebrow && (
      <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
        {eyebrow}
      </span>
    )}
    <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
      {title}
    </h2>
    {description && (
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        {description}
      </p>
    )}
  </Reveal>
);

export default SectionHead;
