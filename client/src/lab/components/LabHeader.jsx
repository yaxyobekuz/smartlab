// Public top navigation for the lab site.
import { Link, NavLink } from "react-router-dom";
import { cn } from "@/shared/utils/cn";
import { CATEGORIES } from "@/lab/data/categories";

const LabHeader = () => (
  <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
    <div className="container flex h-14 items-center justify-between gap-4">
      <Link to="/" className="flex items-center gap-2 font-semibold">
        <span className="text-xl">🔬</span>
        <span>Smartlab</span>
      </Link>

      <nav className="hidden items-center gap-1 md:flex">
        {CATEGORIES.map((c) => (
          <NavLink
            key={c.slug}
            to={`/${c.slug}`}
            className={({ isActive }) =>
              cn(
                "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                isActive && "bg-secondary text-foreground",
              )
            }
          >
            {c.title}
          </NavLink>
        ))}
      </nav>
    </div>
  </header>
);

export default LabHeader;
