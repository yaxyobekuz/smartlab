// Figma-style floating toolbar pinned to the bottom-center of the 3D area.
import { useEffect } from "react";
import {
  Pause,
  Play,
  RotateCcw,
  Maximize2,
  PanelsTopLeft,
  Plus,
  Minus,
  Glasses,
  Headset,
  Footprints,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useSceneControl } from "./sceneControl";

const ToolButton = ({ label, active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    aria-label={label}
    className={cn(
      "grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
      active && "bg-primary/10 text-primary",
    )}
  >
    {children}
  </button>
);

const Toolbar = ({ onToggleFullscreen, onTogglePanels, panelsHidden }) => {
  const {
    paused,
    togglePause,
    reset,
    zoomIn,
    zoomOut,
    vrSupported,
    enterVR,
    gyroSupported,
    toggleCardboard,
    walk,
    toggleWalk,
  } = useSceneControl();

  // Keyboard zoom: +/= zooms in, -/_ zooms out (ignored while typing in a field).
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable)
        return;
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomIn();
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        zoomOut();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomIn, zoomOut]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-1 rounded-xl border border-border bg-background/90 p-1.5 shadow-lg backdrop-blur">
        <ToolButton
          label={paused ? "Davom ettirish" : "To'xtatish"}
          onClick={togglePause}
        >
          {paused ? <Play size={18} /> : <Pause size={18} />}
        </ToolButton>

        <ToolButton label="Kamerani tiklash" onClick={reset}>
          <RotateCcw size={18} />
        </ToolButton>

        <div className="mx-1 h-5 w-px bg-border" />

        <ToolButton label="Uzoqlashtirish" onClick={zoomOut}>
          <Minus size={18} />
        </ToolButton>

        <ToolButton label="Yaqinlashtirish" onClick={zoomIn}>
          <Plus size={18} />
        </ToolButton>

        <div className="mx-1 h-5 w-px bg-border" />

        <ToolButton
          label={panelsHidden ? "Panellarni ko'rsatish" : "Panellarni yashirish"}
          active={panelsHidden}
          onClick={onTogglePanels}
        >
          <PanelsTopLeft size={18} />
        </ToolButton>

        <ToolButton label="To'liq ekran" onClick={onToggleFullscreen}>
          <Maximize2 size={18} />
        </ToolButton>

        <div className="mx-1 h-5 w-px bg-border" />

        {/* Sayohat: kompyuterda WASD + sichqoncha bilan yurish. */}
        {!gyroSupported && (
          <ToolButton label="Sayohat rejimi (WASD)" active={walk} onClick={toggleWalk}>
            <Footprints size={18} />
          </ToolButton>
        )}

        {vrSupported && (
          <ToolButton label="VR rejimi" onClick={enterVR}>
            <Headset size={18} />
          </ToolButton>
        )}

        {gyroSupported && (
          <ToolButton label="VR rejimi (cardboard)" onClick={toggleCardboard}>
            <Glasses size={18} />
          </ToolButton>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
