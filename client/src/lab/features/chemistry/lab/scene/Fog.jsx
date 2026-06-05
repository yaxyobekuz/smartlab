// Tuman — thick dry-ice fog. When water meets dry ice the vessel brims with
// cold CO₂ fog that billows up from the mouth and spills DOWN the sides (the
// fog is denser than air, so it sinks). Soft white puffs, each on its own
// phase, growing and fading as they cascade outward.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { TUBE_MOUTH_Y, TUBE_X } from "./labGeometry";

const COUNT = 18;

const Fog = ({ active, paused = false }) => {
  const meshes = useRef([]);
  const seeds = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        angle: (i / COUNT) * Math.PI * 2 + i * 0.6,
        phase: (i * 0.137) % 1,
        speed: 0.16 + 0.04 * (i % 4),
        spread: 0.6 + 0.25 * (i % 3),
      })),
    [],
  );

  useFrame((state) => {
    if (paused) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < COUNT; i++) {
      const m = meshes.current[i];
      if (!m) continue;
      const s = seeds[i];
      const prog = (t * s.speed + s.phase) % 1;
      const r = prog * s.spread; // spreads outward
      // billows up a touch, then sinks below the mouth (heavy fog)
      const y = Math.sin(prog * Math.PI) * 0.22 - prog * 0.95;
      m.position.set(TUBE_X + Math.cos(s.angle) * r, y, Math.sin(s.angle) * r);
      m.scale.setScalar(0.16 + prog * 0.55);
      const op = active ? 0.4 * (1 - prog) : 0;
      m.material.opacity = op;
      m.visible = op > 0.01;
    }
  });

  return (
    <group position={[TUBE_X, TUBE_MOUTH_Y - 0.1, 0]}>
      {seeds.map((_, i) => (
        <mesh key={i} ref={(m) => (meshes.current[i] = m)} visible={false}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial
            color="#f2f6fa"
            transparent
            opacity={0}
            depthWrite={false}
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  );
};

export default Fog;
