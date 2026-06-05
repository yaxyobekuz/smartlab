// Figma-style full-screen workspace for every topic.
// Left: info + item picker.  Center: 3D scene + bottom toolbar.  Right: AI panel.
import { useEffect, useRef } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Headset, Glasses } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import useObjectState from "@/shared/hooks/useObjectState";
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
  const { panelsHidden, vrDismissed, setField } = useObjectState({
    panelsHidden: false,
    vrDismissed: false,
  });
  const { subject, topic } = useParams();
  const [searchParams] = useSearchParams();
  const {
    inVR,
    vrSupported,
    enterVR,
    cardboard,
    exitCardboard,
    gyroSupported,
    toggleCardboard,
    walk,
    exitWalk,
    setAiContext,
    logAction,
  } = useSceneControl();

  // Bosh sahifadagi "VR laboratoriyaga kirish" tugmasi ?vr=1 bilan keladi.
  const vrRequested = searchParams.get("vr") === "1";

  // Side panels are hidden when manually collapsed OR while in any immersive/walk mode.
  const panelsVisible = !panelsHidden && !cardboard && !inVR && !walk;

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
          // Toolbar is hidden during a WebXR session; the headset drives the view.
          !inVR && (
            <Toolbar
              panelsHidden={panelsHidden}
              onTogglePanels={() => setField("panelsHidden", !panelsHidden)}
              onToggleFullscreen={toggleFullscreen}
            />
          )
        )}

        {/* Sayohat (walk) rejimi yo'riqnomasi */}
        {walk && !inVR && (
          <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center px-4">
            <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border bg-background/90 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              <span>Sudrab qarang · WASD bilan yuring</span>
              <button
                onClick={exitWalk}
                className="rounded-full bg-secondary px-2.5 py-0.5 text-foreground hover:bg-secondary/70"
              >
                Chiqish
              </button>
            </div>
          </div>
        )}

        {/* VR ko'zoynakdan kelinganda: WebXR (Quest) yoki giroskop (telefon). */}
        {vrRequested && !inVR && !cardboard && !vrDismissed && (
          <div className="absolute inset-0 z-40 grid place-items-center bg-background/80 p-6 backdrop-blur">
            <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-xl">
              <div className="mx-auto grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                {vrSupported ? <Headset size={24} /> : <Glasses size={24} />}
              </div>
              <h2 className="mt-3 text-lg font-semibold">VR laboratoriya</h2>
              {vrSupported ? (
                <>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ko'zoynakni kiying va kirish tugmasini bosing. Kontroller
                    bilan reaktivlarni tanlab, tajriba o'tkazishingiz mumkin.
                  </p>
                  <button
                    onClick={enterVR}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Headset size={16} /> VR rejimiga kirish
                  </button>
                </>
              ) : gyroSupported ? (
                <>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Telefonni ko'zoynakka joylang. Boshingizni burib atrofga
                    qarang - telefonni ko'tarsangiz tepaga, tushirsangiz pastga
                    qaraysiz. Ekranni bosib turib oldinga yuriladi.
                  </p>
                  <button
                    onClick={toggleCardboard}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Glasses size={16} /> Giroskop VR rejimiga kirish
                  </button>
                </>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  Bu qurilma VR'ni qo'llab-quvvatlamaydi. Laboratoriyani oddiy
                  rejimda davom ettiring.
                </p>
              )}
              <button
                onClick={() => setField("vrDismissed", true)}
                className="mt-3 text-xs text-muted-foreground hover:text-foreground"
              >
                Oddiy rejimda davom etish
              </button>
            </div>
          </div>
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
