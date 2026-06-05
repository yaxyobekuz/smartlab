// Provides shared state between the 3D Scene and the bottom toolbar.
// `paused` gates auto-rotation; `controlsRef` lets the toolbar reset and zoom the camera.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createXRStore } from "@react-three/xr";
import { SceneControlContext } from "./sceneControl";

const ZOOM_STEP = 1.2; // multiply/divide camera distance per zoom step

export const SceneControlProvider = ({ children }) => {
  const [paused, setPaused] = useState(false);
  const [inVR, setInVR] = useState(false);
  const [vrSupported, setVrSupported] = useState(false);
  const controlsRef = useRef(null);

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
  const reset = () => controlsRef.current?.reset();
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
      }}
    >
      {children}
    </SceneControlContext.Provider>
  );
};
