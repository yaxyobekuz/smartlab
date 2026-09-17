import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useObjectState from "@/shared/hooks/useObjectState";
import { createSnapStore } from "@/shared/utils/snapStore";
import { cn } from "@/shared/utils/cn";
import { BACK_TO, TEXT } from "./data/labRoomContent";
import { detectDevice, loadSettings, saveSettings } from "./labRoomSettings";
import { loadRoomManifest } from "./labRoomAssets";
import { useFpsInput } from "./scene/useFpsInput";
import LabRoomCanvas from "./scene/LabRoomCanvas";
import StartScreen from "./components/StartScreen";
import PauseMenu from "./components/PauseMenu";
import DeviceNotice from "./components/DeviceNotice";
import { Crosshair, DragHint, FpsBadge } from "./components/HudOverlays";
import Hotbar from "./components/Hotbar";
import InteractionPrompt from "./components/InteractionPrompt";
import CabinetMenu from "./components/CabinetMenu";
import { BENCH_LAYOUT } from "./equipment/layout";
import { EQUIPMENT } from "./equipment/catalog";
import { SUBSTANCES } from "./substances/catalog";
import { SUBSTANCE_PREFIX } from "./world/objectTypes";
import { createWorld } from "./world/worldStore";
import { createThumbnailStore } from "./world/thumbnailStore";

// Embedded frames without the pointer-lock permission can't capture the mouse.
const pointerLockBlocked = () => document.featurePolicy?.allowsFeature?.("pointer-lock") === false;

const DEG = Math.PI / 180;

// Dev-only review helpers: ?debug=colliders &pose=x,z,yawDeg,pitchDeg &autostart=1 &hud=0 &showcase= &spacing= &eye= &fov= &lm=
const readDebugParams = () => {
  const off = { colliders: false, pose: null, autostart: false, hud: true, showcase: null, eye: null, fov: null, lightmap: null, spacing: null };
  if (!import.meta.env.DEV) return off;
  const params = new URLSearchParams(window.location.search);
  const parts = params.get("pose")?.split(",").map(Number);
  const pose =
    parts?.length === 4 && parts.every(Number.isFinite)
      ? { x: parts[0], z: parts[1], yaw: parts[2] * DEG, pitch: parts[3] * DEG }
      : null;
  const number = (key) => (params.has(key) && Number.isFinite(Number(params.get(key))) ? Number(params.get(key)) : null);
  return {
    ...off,
    colliders: params.get("debug") === "colliders",
    pose,
    autostart: params.get("autostart") === "1",
    hud: params.get("hud") !== "0",
    showcase: params.get("showcase"),
    eye: number("eye"),
    fov: number("fov"),
    lightmap: ["high", "low"].includes(params.get("lm")) ? params.get("lm") : null,
    spacing: number("spacing"),
  };
};

const LabRoomPage = () => {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const [boot] = useState(() => ({
    device: detectDevice(),
    settings: loadSettings(),
    debug: readDebugParams(),
  }));
  const [fpsStore] = useState(() => createSnapStore(0));
  const [world] = useState(() => createWorld(BENCH_LAYOUT));
  const [thumbs] = useState(createThumbnailStore);
  const modeRef = useRef("pointer");
  const inputRef = useFpsInput(modeRef);
  const activeRef = useRef(false);
  const settingsRef = useRef(boot.settings);
  const poseRef = useRef(boot.debug.pose);
  const resetRef = useRef(0);
  const phaseRef = useRef("start");

  const { phase, view, ready, lockMode, lockHint, notice, manifest, settings, setField, setFields } =
    useObjectState({
      phase: "start",
      view: "main",
      ready: false,
      lockMode: "pointer",
      lockHint: false,
      notice: "",
      manifest: null,
      settings: boot.settings,
    });

  const { device } = boot;
  const tierName = settings.quality ?? device.recommended;

  // Listeners below are registered once; they reach the latest setters through this ref.
  const setters = useRef({ setField, setFields });
  useEffect(() => {
    setters.current = { setField, setFields };
  });

  useEffect(() => {
    phaseRef.current = phase;
    activeRef.current = phase === "playing";
  }, [phase]);

  useEffect(() => {
    settingsRef.current = settings;
    saveSettings(settings);
  }, [settings]);

  // Dev-only handle for automated walk-through tests.
  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    window.__labRoom = { pose: () => poseRef.current, phase: () => phaseRef.current, mode: () => modeRef.current, world, thumbs };
    return () => {
      delete window.__labRoom;
    };
  }, [world, thumbs]);

  useEffect(() => {
    let alive = true;
    loadRoomManifest().then((result) => {
      if (alive) setters.current.setField("manifest", result);
    });
    return () => {
      alive = false;
    };
  }, []);


  const enterDragMode = useCallback(() => {
    modeRef.current = "drag";
    setters.current.setFields({ lockMode: "drag", phase: "playing", view: "main", lockHint: false, notice: "" });
  }, []);

  // Chrome refuses a re-lock for about a second after Esc; the hint asks for another click.
  const play = useCallback(async () => {
    const el = rootRef.current;
    if (!el) return;
    if (modeRef.current === "drag" || pointerLockBlocked()) {
      enterDragMode();
      return;
    }
    try {
      await el.requestPointerLock({ unadjustedMovement: true });
    } catch (error) {
      if (error?.name === "NotSupportedError") {
        try {
          await el.requestPointerLock();
          return;
        } catch {
          // fall through to the hint
        }
      }
      if (error?.name === "WrongDocumentError") {
        enterDragMode();
        return;
      }
      setters.current.setField("lockHint", true);
    }
  }, [enterDragMode]);

  const handleReady = useCallback(() => {
    setters.current.setField("ready", true);
    thumbs.request([...EQUIPMENT.map((e) => e.id), ...SUBSTANCES.map((sub) => `${SUBSTANCE_PREFIX}${sub.id}`)]);
    if (boot.debug.autostart) enterDragMode();
  }, [boot, enterDragMode, thumbs]);

  const actions = useMemo(
    () => ({
      view: (next) => setters.current.setFields({ view: next, notice: "" }),
      reset: () => {
        resetRef.current += 1;
        world.reset();
        setters.current.setField("notice", TEXT.resetDone);
      },
      // The phase changes before the unlock so the lock listener doesn't treat it as a pause.
      openCabinet: () => {
        phaseRef.current = "menu";
        setters.current.setFields({ phase: "menu" });
        if (document.pointerLockElement) document.exitPointerLock();
      },
      closeCabinet: () => {
        if (modeRef.current === "drag") {
          phaseRef.current = "playing";
          setters.current.setFields({ phase: "playing" });
        } else {
          playRef.current();
        }
      },
      exit: () => {
        if (document.pointerLockElement) document.exitPointerLock();
        navigate(BACK_TO);
      },
    }),
    [navigate, world],
  );

  const actionsRef = useRef(actions);
  const playRef = useRef(play);
  useEffect(() => {
    actionsRef.current = actions;
    playRef.current = play;
  });

  useEffect(() => {
    const onLockChange = () => {
      const locked = document.pointerLockElement === rootRef.current;
      if (locked) {
        setters.current.setFields({ phase: "playing", view: "main", lockHint: false, notice: "" });
      } else if (phaseRef.current === "playing" && modeRef.current === "pointer") {
        setters.current.setFields({ phase: "paused", view: "main" });
      }
    };
    // Without a mouse lock the browser doesn't turn Esc into an unlock, so handle it here.
    const onKeyDown = (e) => {
      if (e.code === "Escape" && phaseRef.current === "menu") {
        phaseRef.current = "paused";
        setters.current.setFields({ phase: "paused", view: "main" });
        return;
      }
      if (e.code === "Escape" && modeRef.current === "drag" && phaseRef.current === "playing") {
        setters.current.setFields({ phase: "paused", view: "main" });
        return;
      }
      if (e.code !== "KeyE" || e.repeat || e.target instanceof HTMLInputElement) return;
      if (phaseRef.current === "playing") actionsRef.current.openCabinet();
      else if (phaseRef.current === "menu") actionsRef.current.closeCabinet();
    };
    // Safari reports refused locks only through this event, not a rejected promise.
    const onLockError = () => {
      if (modeRef.current !== "drag") setters.current.setField("lockHint", true);
    };
    document.addEventListener("pointerlockchange", onLockChange);
    document.addEventListener("pointerlockerror", onLockError);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerlockchange", onLockChange);
      document.removeEventListener("pointerlockerror", onLockError);
      window.removeEventListener("keydown", onKeyDown);
      if (document.pointerLockElement) document.exitPointerLock();
    };
  }, []);

  const updateSetting = (key, value) => setField("settings", { ...settings, [key]: value });

  if (!device.webgl2) return <DeviceNotice kind="webgl" />;
  if (device.touchOnly) return <DeviceNotice kind="touch" />;

  const playing = phase === "playing";
  const live = playing || phase === "menu";
  const dragging = lockMode === "drag";

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative h-full w-full select-none overflow-hidden bg-[#0b0e14]",
        playing && dragging && "cursor-grab active:cursor-grabbing",
      )}
      onContextMenu={(e) => e.preventDefault()}
    >
      {manifest && (
        <LabRoomCanvas
          key={tierName}
          tierName={tierName}
          manifest={manifest}
          live={live}
          world={world}
          thumbs={thumbs}
          inputRef={inputRef}
          activeRef={activeRef}
          settingsRef={settingsRef}
          poseRef={poseRef}
          resetRef={resetRef}
          fpsStore={fpsStore}
          debug={boot.debug}
          onReady={handleReady}
        />
      )}

      {playing && boot.debug.hud && <Crosshair />}
      {playing && boot.debug.hud && <InteractionPrompt world={world} />}
      {playing && boot.debug.hud && <Hotbar world={world} thumbs={thumbs} />}
      {phase === "menu" && <CabinetMenu world={world} thumbs={thumbs} onClose={actions.closeCabinet} />}
      {playing && dragging && boot.debug.hud && <DragHint />}
      {settings.showFps && <FpsBadge store={fpsStore} />}

      {phase === "start" && (
        <StartScreen
          ready={ready}
          tier={tierName}
          recommended={device.recommended}
          placeholder={manifest?.placeholder}
          lockHint={lockHint}
          onQuality={(id) => updateSetting("quality", id)}
          onEnter={play}
        />
      )}

      {phase === "paused" && (
        <PauseMenu
          view={view}
          tier={tierName}
          recommended={device.recommended}
          settings={settings}
          notice={notice}
          lockHint={lockHint}
          onView={actions.view}
          onResume={play}
          onReset={actions.reset}
          onExit={actions.exit}
          onQuality={(id) => updateSetting("quality", id)}
          onSetting={updateSetting}
        />
      )}
    </div>
  );
};

export default LabRoomPage;
