// Tuman — MASSIVE dry-ice fog for water + dry ice. Cold CO₂ fog billows up out
// of the tube mouth, pours down the sides like a waterfall and rolls outward in
// a thick blanket across the bench (the fog is denser than air, so it sinks and
// spreads). One InstancedMesh holds ~110 soft puffs (a single draw call); each
// puff loops through its own life — born tiny at the mouth, swelling as it
// cascades and spreads, fading to nothing at the far edge so it recycles.
import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TUBE_MOUTH_Y, TUBE_X } from "./labGeometry";

const COUNT = 110;
const MOUTH = TUBE_MOUTH_Y;
const RISE = 0.4; // how far it billows above the rim
const GROUND = 0.06; // settle height on the bench
const SPREAD = 2.7; // how far the blanket rolls across the bench
const GOLDEN = 2.399963; // golden angle, for an even radial spread

const frac = (n) => n - Math.floor(n);

const Fog = ({ active, paused = false }) => {
  const ref = useRef(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        angle: i * GOLDEN,
        speed: 0.09 + 0.07 * frac(i * 0.37),
        phase: frac(i * 0.137),
        swirl: (i % 2 ? 1 : -1) * (0.15 + 0.35 * frac(i * 0.21)),
        rJitter: 0.7 + 0.55 * frac(i * 0.53),
        sizeJitter: 0.75 + 0.6 * frac(i * 0.29),
      })),
    [],
  );

  // Start collapsed so nothing pops before the first frame.
  useLayoutEffect(() => {
    if (!ref.current) return;
    for (let i = 0; i < COUNT; i++) {
      dummy.position.set(0, -5, 0);
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  useFrame((state) => {
    if (paused || !ref.current) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < COUNT; i++) {
      const s = seeds[i];
      const p = frac(t * s.speed + s.phase);
      const fade = Math.sin(p * Math.PI); // 0 at birth & death

      let y, r, size;
      if (p < 0.18) {
        // Billow up and over the rim.
        const t1 = p / 0.18;
        y = MOUTH - 0.05 + t1 * RISE;
        r = 0.3 + t1 * 0.18;
        size = 0.2 + t1 * 0.18;
      } else {
        // Cascade down the outside and spread out along the bench.
        const t2 = (p - 0.18) / 0.82;
        const e = 1 - (1 - t2) * (1 - t2); // ease-out
        y = (MOUTH - 0.05 + RISE) * (1 - e) + GROUND * e;
        r = 0.45 + e * SPREAD * s.rJitter;
        size = 0.34 + e * 0.55 * s.sizeJitter;
      }

      const a = s.angle + s.swirl * p;
      dummy.position.set(TUBE_X + Math.cos(a) * r, y, Math.sin(a) * r);
      dummy.scale.setScalar(active ? size * fade : 0);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, COUNT]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 10, 10]} />
      <meshStandardMaterial
        color="#eef3fa"
        transparent
        opacity={0.22}
        depthWrite={false}
        roughness={1}
        metalness={0}
      />
    </instancedMesh>
  );
};

export default Fog;
