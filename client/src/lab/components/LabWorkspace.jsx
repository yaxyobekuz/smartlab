// Figma-style full-screen workspace for every topic.
// Left: info + item picker.  Center: 3D scene + bottom toolbar.  Right: AI panel.
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { SceneControlProvider } from "./SceneControlProvider";
import { useSceneControl } from "./sceneControl";
import Toolbar from "./Toolbar";
import AiPanel from "./AiPanel";

const LeftPanel = ({ title, description, backTo, backLabel, items, activeId, onSelect, info }) => (
  <div className="z-10 flex h-full w-72 flex-col border-r border-border bg-card shadow-[4px_0_16px_-4px_rgba(0,0,0,0.06)]">
    <div className="border-b border-border p-4">
      <Link
        to={backTo}
        className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} /> {backLabel}
      </Link>
      <h1 className="text-lg font-semibold">{title}</h1>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
    </div>

    <div className="flex flex-wrap gap-2 border-b border-border p-4">
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

    <div className="min-h-0 flex-1 overflow-y-auto p-4">{info}</div>
  </div>
);

const WorkspaceBody = ({
  title,
  description,
  backTo = "/",
  backLabel = "Orqaga",
  items,
  activeId,
  onSelect,
  scene,
  info,
}) => {
  const rootRef = useRef(null);
  const [panelsHidden, setPanelsHidden] = useState(false);
  const { inVR } = useSceneControl();

  // Side panels are hidden when manually collapsed OR while in VR.
  const panelsVisible = !panelsHidden && !inVR;

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else rootRef.current?.requestFullscreen?.();
  };

  return (
    <div ref={rootRef} className="flex h-full w-full bg-background">
      {panelsVisible && (
        <LeftPanel
          title={title}
          description={description}
          backTo={backTo}
          backLabel={backLabel}
          items={items}
          activeId={activeId}
          onSelect={onSelect}
          info={info}
        />
      )}

      <div className="relative min-w-0 flex-1">
        {scene}
        {!inVR && (
          <Toolbar
            panelsHidden={panelsHidden}
            onTogglePanels={() => setPanelsHidden((v) => !v)}
            onToggleFullscreen={toggleFullscreen}
          />
        )}
      </div>

      {panelsVisible && (
        <aside className="z-10 hidden h-full w-80 border-l border-border bg-card shadow-[-4px_0_16px_-4px_rgba(0,0,0,0.06)] lg:block">
          <AiPanel />
        </aside>
      )}
    </div>
  );
};

const LabWorkspace = (props) => (
  <SceneControlProvider>
    <WorkspaceBody {...props} />
  </SceneControlProvider>
);

export default LabWorkspace;
