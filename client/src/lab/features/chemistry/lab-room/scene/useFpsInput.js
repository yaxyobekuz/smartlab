import { useEffect, useRef } from "react";

// Some systems report a huge jump on the first event after the mouse gets locked.
const MAX_MOUSE_STEP = 250;

// Physical key codes, so WASD also works on Cyrillic/Uzbek keyboard layouts.
// modeRef: "pointer" (mouse locked) or "drag" (look while the left button is held).
export const useFpsInput = (modeRef) => {
  const inputRef = useRef({ keys: new Set(), lookX: 0, lookY: 0 });

  useEffect(() => {
    const input = inputRef.current;
    const clear = () => {
      input.keys.clear();
      input.lookX = 0;
      input.lookY = 0;
    };
    const onKeyDown = (e) => input.keys.add(e.code);
    const onKeyUp = (e) => input.keys.delete(e.code);
    const onMouseMove = (e) => {
      const dragging = modeRef.current === "drag" && (e.buttons & 1) === 1;
      if (!document.pointerLockElement && !dragging) return;
      if (Math.abs(e.movementX) > MAX_MOUSE_STEP || Math.abs(e.movementY) > MAX_MOUSE_STEP) return;
      input.lookX += e.movementX;
      input.lookY += e.movementY;
    };
    const onLockChange = () => {
      if (!document.pointerLockElement && modeRef.current !== "drag") clear();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("blur", clear);
    document.addEventListener("pointerlockchange", onLockChange);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("blur", clear);
      document.removeEventListener("pointerlockchange", onLockChange);
    };
  }, [modeRef]);

  return inputRef;
};
