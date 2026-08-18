import { Link } from "react-router-dom";
import { SUBJECTS } from "@/lab/data/subjects";
import { logoIcon } from "@/shared/assets/icons";

const LandingFooter = () => (
  <footer className="border-t border-border/60 bg-card/40">
    <div className="container flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <img src={logoIcon} alt="Smartlab logotipi" className="size-6" />
          <span>Smartlab</span>
        </Link>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Fanlarni 3D, VR va AI yordamida o'rganadigan virtual laboratoriya.
        </p>
      </div>

      <nav aria-label="Fanlar" className="flex flex-wrap gap-x-5 gap-y-2">
        {SUBJECTS.map((subject) => (
          <Link
            key={subject.slug}
            to={`/${subject.slug}`}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {subject.title}
          </Link>
        ))}
      </nav>
    </div>
  </footer>
);

export default LandingFooter;
