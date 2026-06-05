// Provides shared state between the 3D Scene and the bottom toolbar.
// `paused` gates auto-rotation; `controlsRef` lets the toolbar reset and zoom the camera.
// Also hosts the AI assistant's context + action bus so the agent can drive the scene.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createXRStore } from "@react-three/xr";
import { SceneControlContext } from "./sceneControl";

const ZOOM_STEP = 1.2; // multiply/divide camera distance per zoom step

export const SceneControlProvider = ({ children }) => {
  const navigate = useNavigate();
  const [paused, setPaused] = useState(false);
  const [inVR, setInVR] = useState(false);
  const [vrSupported, setVrSupported] = useState(false);
  const controlsRef = useRef(null);

  // What the user is looking at right now - fed to the AI as live context.
  const [aiContext, setAiContextState] = useState({});
  // Page registers a callback so the agent can select an item (molecule, planet...).
  const onSelectItemRef = useRef(null);
  // Ring buffer of the user's recent actions, so the agent can be proactive.
  const recentActions = useRef([]);

  const setAiContext = useCallback((ctx) => {
    setAiContextState(ctx?.context || {});
    onSelectItemRef.current = ctx?.onSelectItem || null;
  }, []);

  const logAction = useCallback((text) => {
    if (!text) return;
    const buf = recentActions.current;
    buf.push(text);
    if (buf.length > 12) buf.shift();
  }, []);

  // One XR store per workspace; shared with the Canvas (<XR store>) and toolbar.
  const xrStore = useMemo(() => createXRStore(), []);

  // Feature-detect immersive-vr so we only show the button on capable devices.
  useEffect(() => {
    let active = true;
    navigator.xr
      ?.isSessionSupported?.("immersive-vr")
      .then((ok) => active && setVrSupported(!!ok))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Track whether an XR session is currently running.
  useEffect(
    () => xrStore.subscribe((s) => setInVR(s.session != null)),
    [xrStore],
  );

  const togglePause = () => setPaused((p) => !p);
  const reset = useCallback(() => controlsRef.current?.reset(), []);
  const enterVR = useCallback(() => xrStore.enterVR(), [xrStore]);

  // Dolly the camera toward/away from the orbit target, clamped to the
  // controls' min/max distance. `factor < 1` zooms in, `> 1` zooms out.
  const dolly = useCallback((factor) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const camera = controls.object;
    const target = controls.target;
    const dir = camera.position.clone().sub(target);
    const dist = dir.length();
    const next = Math.min(
      controls.maxDistance,
      Math.max(controls.minDistance, dist * factor),
    );
    camera.position.copy(target).add(dir.setLength(next));
    controls.update();
  }, []);

  const zoomIn = useCallback(() => dolly(1 / ZOOM_STEP), [dolly]);
  const zoomOut = useCallback(() => dolly(ZOOM_STEP), [dolly]);

  // Executes a tool call emitted by the AI agent. Returns true when handled,
  // so the panel can show a small "bajarildi" confirmation.
  const runAiAction = useCallback(
    (action) => {
      if (!action?.name) return false;
      switch (action.name) {
        case "control_scene": {
          const a = action.args?.action;
          if (a === "zoom_in") zoomIn();
          else if (a === "zoom_out") zoomOut();
          else if (a === "reset") reset();
          else if (a === "pause") setPaused(true);
          else if (a === "resume") setPaused(false);
          else return false;
          return true;
        }
        case "navigate_topic": {
          const { subject, topic } = action.args || {};
          if (!subject || !topic) return false;
          navigate(`/${subject}/${topic}`);
          return true;
        }
        case "select_item": {
          const id = action.args?.itemId;
          if (!id || !onSelectItemRef.current) return false;
          onSelectItemRef.current(id);
          return true;
        }
        default:
          return false; // start_quiz - panel o'zi qayta ishlaydi
      }
    },
    [zoomIn, zoomOut, reset, navigate],
  );

  return (
    <SceneControlContext.Provider
      value={{
        paused,
        togglePause,
        reset,
        zoomIn,
        zoomOut,
        controlsRef,
        xrStore,
        inVR,
        vrSupported,
        enterVR,
        aiContext,
        setAiContext,
        runAiAction,
        recentActions,
        logAction,
      }}
    >
      {children}
    </SceneControlContext.Provider>
  );
};
