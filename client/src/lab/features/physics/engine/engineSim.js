import { useSyncExternalStore } from "react";
import { isValveOpen, normTheta, pistonTravel, strokeIndex } from "./engineMath";

export const STEP_RPM = 12;

export const snapshotOf = (theta) => ({
  theta: normTheta(theta),
  stroke: strokeIndex(theta),
  travel: pistonTravel(theta),
  intakeOpen: isValveOpen(theta, "intake"),
  exhaustOpen: isValveOpen(theta, "exhaust"),
});

// Snapshot ticks go through this store so only the readouts re-render, not the whole workspace.
export const createSnapStore = (initial) => {
  let value = initial;
  const listeners = new Set();
  return {
    get: () => value,
    set: (next) => {
      value = next;
      listeners.forEach((l) => l());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

export const useSnap = (store) => useSyncExternalStore(store.subscribe, store.get);
