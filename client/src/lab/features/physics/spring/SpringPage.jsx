import Scene from "@/lab/components/Scene";
import LabWorkspace from "@/lab/components/LabWorkspace";
import useObjectState from "@/shared/hooks/useObjectState";
import SpringModel from "./SpringModel";

const PRESETS = [
  { id: "soft", name: "Yumshoq", k: 3, m: 2 },
  { id: "stiff", name: "Qattiq", k: 14, m: 2 },
  { id: "heavy", name: "Og'ir yuk", k: 8, m: 5 },
];

const getPreset = (id) => PRESETS.find((p) => p.id === id) ?? PRESETS[0];

const Slider = ({ label, value, min, max, step, unit, display, onChange }) => (
  <label className="block">
    <div className="flex items-baseline justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{display ?? value}{unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="mt-1 w-full accent-primary"
    />
  </label>
);

const Readout = ({ label, value }) => (
  <div className="flex justify-between gap-3 border-b border-border/60 py-1 last:border-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-right font-semibold tabular-nums">{value}</span>
  </div>
);

const SpringPage = () => {
  const { activeId, k, m, x0, setField, setFields } = useObjectState({
    activeId: PRESETS[0].id,
    k: PRESETS[0].k,
    m: PRESETS[0].m,
    x0: 0.8,
  });

  const handleSelect = (id) => {
    const p = getPreset(id);
    setFields({ activeId: id, k: p.k, m: p.m });
  };

  // Real SHT formulas.
  const omega = Math.sqrt(k / m);
  const period = 2 * Math.PI * Math.sqrt(m / k);
  const frequency = 1 / period;

  return (
    <LabWorkspace
      title="Prujina va SHT"
      description="Qattiqlik va massani o'zgartiring - tebranish davri jonli o'zgaradi. Sahnani aylantiring."
      backTo="/physics"
      backLabel="Fizika"
      items={PRESETS}
      activeId={activeId}
      onSelect={handleSelect}
      aiContext={{
        qattiqlik_k: k,
        massa_m: m,
        davr_s: period.toFixed(2),
      }}
      scene={
        <Scene camera={[0, 0, 9]} controls={{ minDistance: 4 }}>
          <SpringModel k={k} m={m} x0={x0} />
        </Scene>
      }
      info={
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Guk qonuni va garmonik tebranish</h2>
            <p className="text-sm text-muted-foreground">
              Prujinaga osilgan yuk x(t) = x0·cos(ω·t) qonuni bilan tebranadi.
            </p>
          </div>

          <div className="space-y-3">
            <Slider
              label="Qattiqlik (k)"
              value={k}
              min={1}
              max={20}
              step={1}
              unit=" N/m"
              onChange={(v) => setField("k", v)}
            />
            <Slider
              label="Massa (m)"
              value={m}
              min={0.5}
              max={5}
              step={0.1}
              unit=" kg"
              onChange={(v) => setField("m", v)}
            />
            <Slider
              label="Boshlang'ich siljish (x0)"
              value={x0}
              min={0.3}
              max={1.5}
              step={0.1}
              unit=" m"
              onChange={(v) => setField("x0", v)}
            />
          </div>

          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-sm">
            <Readout label="Davr (T = 2π√(m/k))" value={`${period.toFixed(2)} s`} />
            <Readout label="Chastota (f = 1/T)" value={`${frequency.toFixed(2)} Hz`} />
            <Readout label="Burchak chastota (ω = √(k/m))" value={`${omega.toFixed(2)} rad/s`} />
            <p className="pt-2 text-xs text-muted-foreground">
              Amplitudani (x0) o'zgartiring - davr o'zgarmaydi. Massa oshsa yoki
              qattiqlik kamaysa - tebranish sekinlashadi.
            </p>
          </div>
        </div>
      }
    />
  );
};

export default SpringPage;
