// Interaktiv laboratoriya (experiment bench): pick elements/reagents, pour them
// into the beaker, watch colours blend and reactions fire. When the mixture
// adds up to a known molecule, its name and formula appear.
import { useEffect, useMemo, useState } from "react";
import { Flame, Undo2, Trash2, Grid3x3 } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import LabWorkspace from "@/lab/components/LabWorkspace";
import FormulaText from "@/lab/components/FormulaText";
import LabScene from "./scene/LabScene";
import SubstanceChest from "./SubstanceChest";
import PeriodicTableModal from "./PeriodicTableModal";
import { useLabBench } from "./useLabBench";
import {
  SUBSTANCES,
  ELEMENT_SUBSTANCES,
  COMPOUND_SUBSTANCES,
} from "@/lab/data/substances";
import { REACTION_STYLES } from "@/lab/data/reactions";

const SUBSTANCE_BY_ID = Object.fromEntries(SUBSTANCES.map((s) => [s.id, s]));
const REAGENTS = [{ key: "compounds", label: "Reaktivlar", items: COMPOUND_SUBSTANCES }];

const ActionButton = ({ label, active, disabled, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    className={cn(
      "flex items-center justify-center gap-1.5 rounded-lg border border-border px-2 py-2 text-xs font-medium transition-colors",
      active
        ? "border-orange-300 bg-orange-50 text-orange-600"
        : "bg-background hover:bg-secondary",
      disabled && "cursor-not-allowed opacity-40 hover:bg-background",
    )}
  >
    {children}
    {label}
  </button>
);

const LabBenchPage = () => {
  const bench = useLabBench();
  const [showTable, setShowTable] = useState(false);
  const [hiddenSeq, setHiddenSeq] = useState(0);

  // Hide the reaction headline ~2.8s after each new reaction fires. Only the
  // async timeout touches state, so the banner stays a derived value.
  useEffect(() => {
    if (bench.reactionSeq === 0) return;
    const id = setTimeout(() => setHiddenSeq(bench.reactionSeq), 2800);
    return () => clearTimeout(id);
  }, [bench.reactionSeq]);

  const flash =
    bench.reactionSeq > 0 && bench.reactionSeq !== hiddenSeq
      ? bench.reactionEffect
      : null;

  const empty = bench.poured.length === 0;
  const compositionChips = useMemo(
    () => Object.entries(bench.composition).filter(([, n]) => n > 0),
    [bench.composition],
  );

  const quickItems = useMemo(
    () => ELEMENT_SUBSTANCES.map((s) => ({ id: s.id, name: s.name })),
    [],
  );
  const pickById = (id) => {
    const s = SUBSTANCE_BY_ID[id];
    if (s) bench.add(s);
  };

  return (
    <LabWorkspace
      title="Interaktiv laboratoriya"
      description="Element yoki reaktivni idishga quying - ranglar aralashadi, reaksiya yuz beradi."
      backTo="/chemistry"
      backLabel="Kimyo"
      items={quickItems}
      activeId={null}
      onSelect={pickById}
      scene={
        <div className="relative h-full w-full">
          <LabScene
            liquidColor={bench.liquidColor}
            fill={bench.fill}
            heating={bench.heating}
            temperature={bench.temperature}
            reactionSeq={bench.reactionSeq}
            pourSeq={bench.pourSeq}
            pourColor={bench.pourColor}
            fogging={bench.fogging}
          />

          {/* Reaction headline */}
          {flash && flash.kind && (
            <div className="pointer-events-none absolute inset-x-0 top-6 z-10 flex justify-center px-4">
              <div
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-5 py-3 shadow-lg backdrop-blur",
                  REACTION_STYLES[flash.kind],
                )}
              >
                <span className="text-base font-bold">{flash.title}</span>
                <span className="text-sm opacity-90">{flash.detail}</span>
              </div>
            </div>
          )}

          {/* Product banner */}
          {bench.product && (
            <div className="pointer-events-none absolute inset-x-0 top-24 z-10 flex justify-center px-4">
              <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-white/95 px-5 py-3 shadow-lg backdrop-blur">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                  <FormulaText formula={bench.product.formula} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-900">
                    {bench.product.name} hosil bo'ldi
                  </span>
                  <span className="block text-xs text-slate-500">
                    {bench.product.weight} g/mol
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Overflow warning */}
          {bench.overfilled && (
            <div className="pointer-events-none absolute inset-x-0 bottom-20 z-10 flex justify-center px-4">
              <div className="rounded-full border border-amber-300 bg-amber-50/95 px-4 py-1.5 text-sm font-medium text-amber-700 shadow-sm backdrop-blur">
                Idish to'ldi - suyuqlik toshib ketdi
              </div>
            </div>
          )}
        </div>
      }
      info={
        <div className="space-y-4">
          {/* Actions */}
          <div className="grid grid-cols-2 gap-1.5">
            <ActionButton
              label="Isitish"
              active={bench.heating}
              onClick={bench.toggleHeat}
            >
              <Flame size={14} />
            </ActionButton>
            <ActionButton label="Davriy jadval" onClick={() => setShowTable(true)}>
              <Grid3x3 size={14} />
            </ActionButton>
            <ActionButton label="Qaytarish" disabled={empty} onClick={bench.undo}>
              <Undo2 size={14} />
            </ActionButton>
            <ActionButton label="Tozalash" disabled={empty} onClick={bench.clear}>
              <Trash2 size={14} />
            </ActionButton>
          </div>

          {/* Mixture summary */}
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-2">
              <span
                className="h-6 w-6 shrink-0 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: bench.liquidColor }}
              />
              {bench.product ? (
                <div className="min-w-0">
                  <FormulaText
                    formula={bench.product.formula}
                    className="text-sm font-semibold text-primary"
                  />
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    {bench.product.name}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {empty ? "Idish bo'sh" : "Aralashma"}
                </span>
              )}
            </div>
            {!empty && (
              <div className="mt-2 flex flex-wrap gap-1">
                {compositionChips.map(([sym, n]) => (
                  <span
                    key={sym}
                    className="rounded bg-secondary px-1.5 py-0.5 text-[11px] font-medium"
                  >
                    {sym}
                    {n > 1 ? <sub>{n}</sub> : null}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Reagents */}
          <SubstanceChest onPick={bench.add} groups={REAGENTS} />

          {/* Journal */}
          {bench.history.length > 0 && (
            <div>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Jurnal
              </h3>
              <ol className="space-y-1">
                {bench.history.slice(-8).map((h) => (
                  <li
                    key={h.index}
                    className="flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1 text-xs"
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: h.color }}
                    />
                    <FormulaText formula={h.formula} className="font-medium" />
                    {h.reaction && (
                      <span className="ml-auto text-[10px] font-semibold text-orange-600">
                        {h.reaction}
                      </span>
                    )}
                    {!h.reaction && h.product && (
                      <span className="ml-auto text-[10px] text-primary">
                        {h.product}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {showTable && (
            <PeriodicTableModal onPick={bench.add} onClose={() => setShowTable(false)} />
          )}
        </div>
      }
    />
  );
};

export default LabBenchPage;
