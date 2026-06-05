// Provides shared state between the 3D Scene and the bottom toolbar.
// `paused` gates auto-rotation; `controlsRef` lets the toolbar reset the camera.
import { useRef, useState } from "react";
import { SceneControlContext } from "./sceneControl";

export const SceneControlProvider = ({ children }) => {
  const [paused, setPaused] = useState(false);
  const controlsRef = useRef(null);

  const togglePause = () => setPaused((p) => !p);
  const reset = () => controlsRef.current?.reset();

  return (
    <SceneControlContext.Provider
      value={{ paused, togglePause, reset, controlsRef }}
    >
      {children}
    </SceneControlContext.Provider>
  );
};
