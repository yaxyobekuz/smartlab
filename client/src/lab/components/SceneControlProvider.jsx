// Provides shared state between the 3D Scene and the bottom toolbar.
// `paused` gates auto-rotation; `controlsRef` lets the toolbar reset and zoom the camera.
// Also hosts the AI assistant's context + action bus so the agent can drive the scene.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SceneControlContext } from "./sceneControl";
import { xrStore } from "./xrStore";

const ZOOM_STEP = 1.2; // multiply/divide camera distance per zoom step

// Phone cardboard VR is feasible when the device exposes orientation events.
// (Touch + a coarse pointer ~ a phone; DeviceOrientationEvent ~ a gyroscope.)
const detectGyro = () =>
  typeof window !== "undefined" &&
  "DeviceOrientationEvent" in window &&
  window.matchMedia?.("(pointer: coarse)").matches;

export const SceneControlProvider = ({ children }) => {
  const navigate = useNavigate();
  const [paused, setPaused] = useState(false);
  const [inVR, setInVR] = useState(false);
  const [vrSupported, setVrSupported] = useState(false);
  const [cardboard, setCardboard] = useState(false);
  const [walk, setWalk] = useState(false);
  const [gyroSupported] = useState(detectGyro);
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
    [],
  );

  const enterVR = useCallback(() => xrStore.enterVR(), []);

  // iOS 13+ needs an explicit gesture-triggered permission for gyroscope.
  const requestGyroPermission = useCallback(async () => {
    const D = window.DeviceOrientationEvent;
    if (D && typeof D.requestPermission === "function") {
      try {
        return (await D.requestPermission()) === "granted";
      } catch {
        return false;
      }
    }
    return true;
  }, []);

  const exitCardboard = useCallback(() => setCardboard(false), []);
  const toggleCardboard = useCallback(async () => {
    if (cardboard) {
      setCardboard(false);
      return;
    }
    const ok = await requestGyroPermission();
    if (ok) setCardboard(true);
  }, [cardboard, requestGyroPermission]);

  // Desktop first-person walk mode (mutually exclusive with cardboard).
  const exitWalk = useCallback(() => setWalk(false), []);
  const toggleWalk = useCallback(() => {
    setCardboard(false);
    setWalk((w) => !w);
  }, []);

  // Esc leaves walk mode.
  useEffect(() => {
    if (!walk) return;
    const onKey = (e) => e.key === "Escape" && setWalk(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [walk]);

  const togglePause = () => setPaused((p) => !p);
  const reset = useCallback(() => controlsRef.current?.reset(), []);

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

  // Leaving cardboard mode on Escape (e.g. when testing on desktop).
  useEffect(() => {
    if (!cardboard) return;
    const onKey = (e) => e.key === "Escape" && setCardboard(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cardboard]);

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

  const value = useMemo(
    () => ({
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
      cardboard,
      gyroSupported,
      toggleCardboard,
      exitCardboard,
      walk,
      toggleWalk,
      exitWalk,
      aiContext,
      setAiContext,
      runAiAction,
      recentActions,
      logAction,
    }),
    [
      paused,
      reset,
      zoomIn,
      zoomOut,
      inVR,
      vrSupported,
      enterVR,
      cardboard,
      gyroSupported,
      toggleCardboard,
      exitCardboard,
      walk,
      toggleWalk,
      exitWalk,
      aiContext,
      setAiContext,
      runAiAction,
      logAction,
    ],
  );

  return (
    <SceneControlContext.Provider value={value}>
      {children}
    </SceneControlContext.Provider>
  );
};
