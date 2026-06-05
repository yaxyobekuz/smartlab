// Public top navigation for the lab site.
import { Link, NavLink } from "react-router-dom";
import { cn } from "@/shared/utils/cn";
import { logoIcon } from "@/shared/assets/icons";
import { SUBJECTS } from "@/lab/data/subjects";

const LabHeader = () => (
  <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
    <div className="container flex h-14 items-center justify-between gap-4">
      <Link to="/" className="flex items-center gap-2 font-semibold">
        <img src={logoIcon} alt="Smartlab logo" className="size-6" />
        <span>Smartlab</span>
      </Link>

      <nav className="hidden items-center gap-1 md:flex">
        {SUBJECTS.map((s) => (
          <NavLink
            key={s.slug}
            to={`/${s.slug}`}
            className={({ isActive }) =>
              cn(
                "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                isActive && "bg-secondary text-foreground",
              )
            }
          >
            {s.title}
          </NavLink>
        ))}
      </nav>
    </div>
  </header>
);

export default LabHeader;
