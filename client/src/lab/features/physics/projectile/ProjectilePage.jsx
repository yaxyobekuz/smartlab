import Scene from "@/lab/components/Scene";
import LabWorkspace from "@/lab/components/LabWorkspace";
import useObjectState from "@/shared/hooks/useObjectState";
import ProjectileModel from "./ProjectileModel";

// Tortishish maydonlari (m/s²) - preset sifatida ishlatiladi.
const BODIES = [
  { id: "earth", name: "Yer", g: 9.8 },
  { id: "moon", name: "Oy", g: 1.6 },
  { id: "mars", name: "Mars", g: 3.7 },
];

const getBody = (id) => BODIES.find((b) => b.id === id) ?? BODIES[0];

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

const ProjectilePage = () => {
  const { activeId, g, angleDeg, v0, setField, setFields } = useObjectState({
    activeId: BODIES[0].id,
    g: BODIES[0].g,
    angleDeg: 45,
    v0: 15,
  });

  const handleSelect = (id) => {
    const body = getBody(id);
    setFields({ activeId: id, g: body.g });
  };

  // Real formulalar.
  const angleRad = (angleDeg * Math.PI) / 180;
  const range = (v0 * v0 * Math.sin(2 * angleRad)) / g;
  const height = Math.pow(v0 * Math.sin(angleRad), 2) / (2 * g);
  const flightTime = (2 * v0 * Math.sin(angleRad)) / g;

  return (
    <LabWorkspace
      title="Otilma harakat"
      description="Burchak va tezlikni o'zgartirib snaryad trayektoriyasini kuzating."
      backTo="/physics"
      backLabel="Fizika"
      items={BODIES}
      activeId={activeId}
      onSelect={handleSelect}
      aiContext={{
        burchak_deg: angleDeg,
        tezlik_v0: v0,
        masofa_m: Number(range.toFixed(1)),
        balandlik_m: Number(height.toFixed(1)),
      }}
      scene={
        <Scene camera={[0, 3, 11]} controls={{ minDistance: 5 }}>
          <ProjectileModel
            v0={v0}
            angleRad={angleRad}
            g={g}
            range={range}
            height={height}
            flightTime={flightTime}
          />
        </Scene>
      }
      info={
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{getBody(activeId).name}da otilma harakat</h2>
            <p className="text-sm text-muted-foreground">
              Tortishish: g = {g} m/s². Yuqoridagi tugmalar bilan sayyorani almashtiring.
            </p>
          </div>

          <div className="space-y-3">
            <Slider
              label="Otish burchagi (θ)"
              value={angleDeg}
              min={10}
              max={80}
              step={1}
              unit="°"
              onChange={(val) => setField("angleDeg", val)}
            />
            <Slider
              label="Boshlang'ich tezlik (v₀)"
              value={v0}
              min={5}
              max={30}
              step={1}
              unit=" m/s"
              onChange={(val) => setField("v0", val)}
            />
          </div>

          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-sm">
            <Readout label="Uchish masofasi (R = v₀²·sin2θ/g)" value={`${range.toFixed(1)} m`} />
            <Readout label="Maksimal balandlik (H = (v₀·sinθ)²/2g)" value={`${height.toFixed(1)} m`} />
            <Readout label="Uchish vaqti (t = 2·v₀·sinθ/g)" value={`${flightTime.toFixed(2)} s`} />
          </div>

          <div className="rounded-lg border border-border/60 px-3 py-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Diqqat:</span> 45° burchak eng uzoq masofani beradi.
          </div>
        </div>
      }
    />
  );
};

export default ProjectilePage;
