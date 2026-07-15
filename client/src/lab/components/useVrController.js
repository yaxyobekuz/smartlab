// Bluetooth VR remote (SHINECON-style) input for VR box mode.
// These remotes enumerate either as an HID gamepad (Gamepad API) or as a
// Bluetooth keyboard (arrow keys / Enter...). We read BOTH so it works whichever
// mode the remote is in: analog axes are polled live into a ref (read each frame
// by the render loop) and discrete presses fire registered edge callbacks once.
import { useCallback, useEffect, useRef, useState } from "react";

const DEADZONE = 0.18;
const dz = (v) => (Math.abs(v) < DEADZONE ? 0 : v);

// Standard gamepad face buttons: 0=A, 1=B, 2=X, 3=Y. Unknown indices are logged
// so the mapping can be tuned for a specific remote.
const GP_ACTION = { 0: "select", 1: "back", 2: "zoomIn", 3: "zoomOut" };

// Keyboard fallback (remote in keyboard mode). Escape is intentionally left out -
// it already exits VR box mode.
const KEY_ACTION = {
  Enter: "select",
  NumpadEnter: "select",
  Space: "select",
  Backspace: "back",
  Equal: "zoomIn",
  NumpadAdd: "zoomIn",
  BracketRight: "zoomIn",
  Minus: "zoomOut",
  NumpadSubtract: "zoomOut",
  BracketLeft: "zoomOut",
};

export default function useVrController({ enabled = true } = {}) {
  const [connected, setConnected] = useState(false);
  const connRef = useRef(false);
  // Live analog state, read by the render loop each frame (no re-render).
  const axes = useRef({ x: 0, y: 0 });
  // action -> Set<fn>
  const listeners = useRef(new Map());

  const on = useCallback((action, fn) => {
    const map = listeners.current;
    if (!map.has(action)) map.set(action, new Set());
    map.get(action).add(fn);
    return () => map.get(action)?.delete(fn);
  }, []);

  const fire = useCallback((action) => {
    listeners.current.get(action)?.forEach((fn) => fn());
  }, []);

  useEffect(() => {
    if (!enabled) {
      axes.current = { x: 0, y: 0 };
      return;
    }

    // Reflect connection only on change (a pad may already be paired before mount;
    // gamepadconnected won't re-fire, so the poll below picks it up).
    const markConnected = (v) => {
      if (v !== connRef.current) {
        connRef.current = v;
        setConnected(v);
      }
    };

    // --- Keyboard mode ---
    const keys = { left: false, right: false, up: false, down: false };
    const isTyping = (t) =>
      t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable;
    const onKeyDown = (e) => {
      if (isTyping(e.target)) return;
      switch (e.code) {
        case "ArrowLeft": keys.left = true; break;
        case "ArrowRight": keys.right = true; break;
        case "ArrowUp": keys.up = true; break;
        case "ArrowDown": keys.down = true; break;
        default: {
          const a = KEY_ACTION[e.code];
          if (a && !e.repeat) fire(a);
        }
      }
    };
    const onKeyUp = (e) => {
      if (e.code === "ArrowLeft") keys.left = false;
      else if (e.code === "ArrowRight") keys.right = false;
      else if (e.code === "ArrowUp") keys.up = false;
      else if (e.code === "ArrowDown") keys.down = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // --- Gamepad mode (polled) ---
    const prev = {};
    let raf = 0;
    const poll = () => {
      const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()) : [];
      const pad = pads.find(Boolean) || null;
      markConnected(!!pad);
      let x = 0;
      let y = 0;
      if (pad) {
        x = dz(pad.axes[0] || 0);
        y = dz(pad.axes[1] || 0);
        // Some remotes report the stick on axes 2/3 instead.
        if (x === 0 && y === 0) {
          x = dz(pad.axes[2] || 0);
          y = dz(pad.axes[3] || 0);
        }
        pad.buttons.forEach((b, i) => {
          const pressed = b.pressed || b.value > 0.5;
          if (pressed && !prev[i]) {
            const a = GP_ACTION[i];
            if (a) fire(a);
            else console.debug("VR remote: unmapped button", i);
          }
          prev[i] = pressed;
        });
      }
      // Keyboard axes override the stick when a key is held.
      if (keys.left) x = -1;
      else if (keys.right) x = 1;
      if (keys.up) y = -1;
      else if (keys.down) y = 1;
      axes.current = { x, y };
      raf = requestAnimationFrame(poll);
    };
    raf = requestAnimationFrame(poll);

    const onConn = () => markConnected(true);
    const onDisc = () => {
      const now = navigator.getGamepads ? navigator.getGamepads() : [];
      markConnected(Array.from(now).some(Boolean));
    };
    window.addEventListener("gamepadconnected", onConn);
    window.addEventListener("gamepaddisconnected", onDisc);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("gamepadconnected", onConn);
      window.removeEventListener("gamepaddisconnected", onDisc);
      axes.current = { x: 0, y: 0 };
    };
  }, [enabled, fire]);

  return { axes, connected, on };
}
