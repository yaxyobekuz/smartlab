import Scene from "@/lab/components/Scene";
import LabWorkspace from "@/lab/components/LabWorkspace";
import useObjectState from "@/shared/hooks/useObjectState";
import WaveModel from "./WaveModel";
import { WAVES, getWave } from "@/lab/data/waves";

const G = 9.81;

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

const WavePage = () => {
  const { activeId, type, amplitude, frequency, wavelength, length, angle, setField, setFields } =
    useObjectState({
      activeId: WAVES[0].id,
      type: WAVES[0].type,
      amplitude: WAVES[0].amplitude,
      frequency: WAVES[0].frequency,
      wavelength: WAVES[0].wavelength,
      length: 1.5,
      angle: 0.3,
    });

  const wave = getWave(activeId);

  const handleSelect = (id) => {
    const w = getWave(id);
    setFields({
      activeId: id,
      type: w.type,
      amplitude: w.amplitude ?? amplitude,
      frequency: w.frequency ?? frequency,
      wavelength: w.wavelength ?? wavelength,
      length: w.length ?? length,
      angle: w.angle ?? angle,
    });
  };

  // Live derived quantities (real physics).
  const period = type === "pendulum"
    ? 2 * Math.PI * Math.sqrt(length / G)
    : 1 / frequency;
  const waveSpeed = frequency * wavelength;
  const pendFreq = 1 / period;

  return (
    <LabWorkspace
      title="To'lqin va tebranish"
      description="Slayderlarni suring - qiymatlar jonli o'zgaradi. Sahnani aylantirib ko'ring."
      backTo="/physics"
      backLabel="Fizika"
      items={WAVES}
      activeId={activeId}
      onSelect={handleSelect}
      aiContext={
        type === "pendulum"
          ? { uzunlik_m: length, davr_s: period.toFixed(2), chastota_hz: pendFreq.toFixed(2) }
          : {
              amplituda: amplitude,
              chastota_hz: frequency,
              tolqin_uzunligi: wavelength,
              davr_s: period.toFixed(2),
              tezlik: waveSpeed.toFixed(2),
            }
      }
      scene={
        <Scene camera={[0, 0, 9]} controls={{ minDistance: 4 }}>
          <WaveModel
            type={type}
            amplitude={amplitude}
            frequency={frequency}
            wavelength={wavelength}
            length={length}
            angle={angle}
          />
        </Scene>
      }
      info={
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{wave.name}</h2>
            <p className="text-sm text-muted-foreground">{wave.about}</p>
          </div>

          <div className="space-y-3">
            {type === "pendulum" ? (
              <>
                <Slider
                  label="Ip uzunligi (L)"
                  value={length}
                  min={0.5}
                  max={3}
                  step={0.1}
                  unit=" m"
                  onChange={(v) => setField("length", v)}
                />
                <Slider
                  label="Boshlang'ich burchak"
                  value={angle}
                  min={0.09}
                  max={0.7}
                  step={0.02}
                  unit="°"
                  display={Math.round((angle * 180) / Math.PI)}
                  onChange={(v) => setField("angle", v)}
                />
              </>
            ) : (
              <>
                <Slider
                  label="Amplituda (A)"
                  value={amplitude}
                  min={0.2}
                  max={2}
                  step={0.1}
                  onChange={(v) => setField("amplitude", v)}
                />
                <Slider
                  label="Chastota (f)"
                  value={frequency}
                  min={0.1}
                  max={1.5}
                  step={0.05}
                  unit=" Hz"
                  onChange={(v) => setField("frequency", v)}
                />
                <Slider
                  label="To'lqin uzunligi (λ)"
                  value={wavelength}
                  min={1}
                  max={6}
                  step={0.25}
                  unit=" birlik"
                  onChange={(v) => setField("wavelength", v)}
                />
              </>
            )}
          </div>

          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-sm">
            {type === "pendulum" ? (
              <>
                <Readout label="Davr (T = 2π√(L/g))" value={`${period.toFixed(2)} s`} />
                <Readout label="Chastota (f = 1/T)" value={`${pendFreq.toFixed(2)} Hz`} />
                <p className="pt-2 text-xs text-muted-foreground">
                  Burchakni o'zgartiring - davr o'zgarmaydi. Faqat uzunlik ta'sir qiladi.
                </p>
              </>
            ) : (
              <>
                <Readout label="Davr (T = 1/f)" value={`${period.toFixed(2)} s`} />
                <Readout label="Tezlik (v = f · λ)" value={`${waveSpeed.toFixed(2)} birlik/s`} />
              </>
            )}
          </div>
        </div>
      }
    />
  );
};

export default WavePage;
