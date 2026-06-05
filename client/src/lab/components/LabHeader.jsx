// Public top navigation for the lab site.
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { logoIcon } from "@/shared/assets/icons";
import { SUBJECTS } from "@/lab/data/subjects";

const LabHeader = () => {
  const [open, setOpen] = useState(false);

  return (
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

        {/* Mobil menyu tugmasi */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
          className="grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobil menyu paneli */}
      {open && (
        <nav className="container flex flex-col gap-1 border-t border-border/60 py-2 md:hidden">
          {SUBJECTS.map((s) => (
            <NavLink
              key={s.slug}
              to={`/${s.slug}`}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  isActive && "bg-secondary text-foreground",
                )
              }
            >
              {s.title}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
};

export default LabHeader;
