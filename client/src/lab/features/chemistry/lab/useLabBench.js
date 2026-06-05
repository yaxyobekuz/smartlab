// Live state of the laboratory vessel: pour substances, blend colours, detect
// reactions (offline rules) and recognise the molecule the mixture adds up to.
// A lighter port of SmartLab's useBench — no external service, no sound.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addComposition,
  findProduct,
} from "@/lab/data/molecules";
import { blendColors } from "@/lab/data/chemColor";
import {
  classifyReaction,
  effectForStatus,
  PRODUCT_COLORS,
} from "@/lab/data/reactions";

// Pours before the vessel reads as "full" (just for the fill animation).
const CAPACITY = 6;
const EMPTY_COLOR = "#dfe9f2";

// Symbols of the elemental substances poured in (compounds don't count).
const elementSymbols = (list) =>
  new Set(list.filter((s) => s.kind === "element").map((s) => s.formula));

const compositionOf = (list) => {
  const comp = {};
  for (const s of list) addComposition(comp, s.composition);
  return comp;
};

export const useLabBench = () => {
  const [poured, setPoured] = useState([]);
  const [history, setHistory] = useState([]);
  const [pour, setPour] = useState({ seq: 0, color: EMPTY_COLOR, state: "suyuq" });
  const [reaction, setReaction] = useState({ seq: 0, effect: null });
  const [heating, setHeating] = useState(false);
  const [temperature, setTemperature] = useState(0);
  const heatingRef = useRef(false);

  const toggleHeat = useCallback(() => {
    setHeating((on) => {
      heatingRef.current = !on;
      return !on;
    });
  }, []);

  // Temperature eases toward boiling while the burner is on, cools when off.
  useEffect(() => {
    const id = window.setInterval(() => {
      setTemperature((t) => {
        const target = heatingRef.current ? 1 : 0;
        const next = t + (target - t) * 0.05;
        return Math.abs(next - target) < 0.004 ? target : next;
      });
    }, 80);
    return () => window.clearInterval(id);
  }, []);

  const add = useCallback((substance) => {
    setPoured((prev) => {
      const next = [...prev, substance];

      const beforeStatus = classifyReaction(elementSymbols(prev));
      const status = classifyReaction(elementSymbols(next));
      const fired = status && status !== beforeStatus;
      const effect = fired ? effectForStatus(status) : null;
      const stepProduct = findProduct(compositionOf(next));

      if (fired) setReaction((r) => ({ seq: r.seq + 1, effect }));
      setPour((p) => ({ seq: p.seq + 1, color: substance.color, state: substance.state }));
      setHistory((h) => [
        ...h,
        {
          index: next.length,
          name: substance.name,
          formula: substance.formula,
          color: substance.color,
          reaction: effect ? effect.title : null,
          product: stepProduct ? stepProduct.name : null,
        },
      ]);
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setPoured((prev) => prev.slice(0, -1));
    setHistory((h) => h.slice(0, -1));
  }, []);

  const clear = useCallback(() => {
    setPoured([]);
    setHistory([]);
    setPour((p) => ({ ...p, seq: 0 }));
    setReaction((r) => ({ ...r, effect: null }));
  }, []);

  const composition = useMemo(() => compositionOf(poured), [poured]);
  const product = useMemo(() => findProduct(composition), [composition]);

  const liquidColor = useMemo(() => {
    if (poured.length === 0) return EMPTY_COLOR;
    if (product && PRODUCT_COLORS[product.id]) return PRODUCT_COLORS[product.id];
    return blendColors(poured.map((s) => ({ color: s.color, weight: 1 })));
  }, [poured, product]);

  return {
    poured,
    history,
    composition,
    product,
    liquidColor,
    fill: Math.min(poured.length / CAPACITY, 1),
    overfilled: poured.length > CAPACITY,
    pourSeq: pour.seq,
    reactionSeq: reaction.seq,
    reactionEffect: reaction.effect,
    heating,
    temperature,
    add,
    undo,
    clear,
    toggleHeat,
  };
};
