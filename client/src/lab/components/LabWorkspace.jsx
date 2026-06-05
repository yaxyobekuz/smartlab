// Figma-style full-screen workspace for every topic.
// Left: info + item picker.  Center: 3D scene + bottom toolbar.  Right: AI panel.
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
  aiContext,
}) => {
  const rootRef = useRef(null);
  const [panelsHidden, setPanelsHidden] = useState(false);
  const { subject, topic } = useParams();
  const { cardboard, exitCardboard, setAiContext, logAction } =
    useSceneControl();

  // Side panels are hidden when manually collapsed OR while in cardboard VR.
  const panelsVisible = !panelsHidden && !cardboard;

  // Feed the live page context to the AI agent (subject, topic, items, active item).
  useEffect(() => {
    setAiContext({
      context: {
        subject,
        topic,
        title,
        items: items?.map((it) => ({ id: it.id, name: it.name })),
        activeItem: items?.find((it) => it.id === activeId)?.name,
        ...aiContext,
      },
      onSelectItem: onSelect,
    });
  }, [subject, topic, title, items, activeId, aiContext, onSelect, setAiContext]);

  // Note in the action journal which item the user is viewing.
  useEffect(() => {
    const name = items?.find((it) => it.id === activeId)?.name;
    if (name) logAction(`"${name}" modelini ko'rdi`);
  }, [activeId, items, logAction]);

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

        {cardboard ? (
          <>
            {/* Center seam to help align the phone in the headset. */}
            <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-px -translate-x-1/2 bg-white/40" />
            <button
              onClick={exitCardboard}
              className="absolute right-3 top-3 z-30 rounded-lg bg-background/90 px-3 py-1.5 text-sm font-medium shadow-md backdrop-blur"
            >
              Chiqish
            </button>
          </>
        ) : (
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
