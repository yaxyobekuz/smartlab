// Provides shared state between the 3D Scene and the bottom toolbar.
// `paused` gates auto-rotation; `controlsRef` lets the toolbar reset and zoom the camera.
import { useCallback, useRef, useState } from "react";
import { SceneControlContext } from "./sceneControl";

const ZOOM_STEP = 1.2; // multiply/divide camera distance per zoom step

export const SceneControlProvider = ({ children }) => {
  const [paused, setPaused] = useState(false);
  const controlsRef = useRef(null);

  const togglePause = () => setPaused((p) => !p);
  const reset = () => controlsRef.current?.reset();

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
      value={{ paused, togglePause, reset, zoomIn, zoomOut, controlsRef }}
    >
      {children}
    </SceneControlContext.Provider>
  );
};
