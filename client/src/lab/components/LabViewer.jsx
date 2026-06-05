// Shared two-column layout for every category page.
// Left: 3D scene. Right: title, item picker and an info panel.
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/shared/utils/cn";

const LabViewer = ({
  title,
  description,
  items,
  activeId,
  onSelect,
  scene,
  info,
  backTo = "/",
  backLabel = "Bosh sahifa",
}) => (
  <div className="container py-6">
    <Link
      to={backTo}
      className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft size={16} /> {backLabel}
    </Link>

    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-secondary/40 to-background">
        <div className="h-[60vh] min-h-[380px]">{scene}</div>
      </div>

      <aside className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => onSelect(it.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                activeId === it.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-secondary",
              )}
            >
              {it.name}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">{info}</div>
      </aside>
    </div>
  </div>
);

export default LabViewer;
