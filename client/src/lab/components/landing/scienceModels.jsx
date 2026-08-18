// Hero fonidagi yengil (low-poly) fan modellari. Har biri platformadagi bir
// bo'limga ishora qiladi: kimyo, biologiya, fizika, elektronika, tarix, atlas.
// GLB yo'q - hammasi primitivlardan, shuning uchun bosh sahifa yuki ortmaydi.
import { Fragment, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Instance, Instances } from "@react-three/drei";
import * as THREE from "three";

// Binafsha asos + har fan uchun bitta urg'u rangi.
const P = {
  violet: "#8b5cf6",
  purple: "#a855f7",
  fuchsia: "#d946ef",
  indigo: "#6366f1",
  light: "#c4b5fd",
  green: "#34d399",
  sky: "#38bdf8",
  amber: "#fbbf24",
};

const mat = (color, extra = {}) => ({
  color,
  roughness: 0.32,
  metalness: 0.06,
  emissive: color,
  emissiveIntensity: 0.3,
  ...extra,
});

const UP = new THREE.Vector3(0, 1, 0);

// (0,1,0) o'qini berilgan yo'nalishga buradi - tayoqcha/bog' silindrlari uchun.
const orient = (x, y, z) =>
  new THREE.Quaternion().setFromUnitVectors(
    UP,
    new THREE.Vector3(x, y, z).normalize(),
  );

/* ------------------------------- Kimyo ---------------------------------- */

export const Atom = () => {
  const g = useRef(null);
  useFrame((_, d) => {
    if (g.current) g.current.rotation.y += d * 0.5;
  });

  return (
    <group ref={g}>
      <mesh>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial {...mat(P.fuchsia, { emissiveIntensity: 0.55 })} />
      </mesh>
      <mesh rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[0.66, 0.026, 8, 44]} />
        <meshStandardMaterial {...mat(P.violet)} />
      </mesh>
      <mesh rotation={[Math.PI / 2.3, Math.PI / 2.5, Math.PI / 3]}>
        <torusGeometry args={[0.66, 0.026, 8, 44]} />
        <meshStandardMaterial {...mat(P.light)} />
      </mesh>
    </group>
  );
};

const MOLECULE_NODES = [
  [0, 0, 0, 0.24, P.purple],
  [0.44, 0.2, 0, 0.16, P.light],
  [-0.4, 0.24, 0.1, 0.16, P.fuchsia],
  [0.05, -0.44, 0.15, 0.16, P.indigo],
];

export const Molecule = () => {
  const bonds = useMemo(
    () =>
      MOLECULE_NODES.slice(1).map(([x, y, z]) => ({
        mid: [x / 2, y / 2, z / 2],
        len: Math.hypot(x, y, z),
        q: orient(x, y, z),
      })),
    [],
  );

  return (
    <group>
      {MOLECULE_NODES.map(([x, y, z, r, c], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 16, 12]} />
          <meshStandardMaterial {...mat(c)} />
        </mesh>
      ))}
      {bonds.map(({ mid, len, q }, i) => (
        <mesh key={`b${i}`} position={mid} quaternion={q}>
          <cylinderGeometry args={[0.028, 0.028, len, 6]} />
          <meshStandardMaterial {...mat(P.light, { emissiveIntensity: 0.2 })} />
        </mesh>
      ))}
    </group>
  );
};

export const TestTube = () => (
  <group rotation={[0, 0, 0.32]}>
    <mesh position={[0, 0.06, 0]}>
      <cylinderGeometry args={[0.17, 0.17, 0.8, 14, 1, true]} />
      <meshStandardMaterial
        {...mat(P.light, {
          emissiveIntensity: 0.12,
          transparent: true,
          opacity: 0.32,
          side: THREE.DoubleSide,
        })}
      />
    </mesh>
    <mesh position={[0, -0.34, 0]}>
      <sphereGeometry args={[0.17, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      <meshStandardMaterial
        {...mat(P.light, {
          emissiveIntensity: 0.12,
          transparent: true,
          opacity: 0.32,
          side: THREE.DoubleSide,
        })}
      />
    </mesh>
    {/* ichidagi reaktiv */}
    <mesh position={[0, -0.18, 0]}>
      <cylinderGeometry args={[0.145, 0.145, 0.32, 12]} />
      <meshStandardMaterial {...mat(P.fuchsia, { emissiveIntensity: 0.5 })} />
    </mesh>
    <mesh position={[0, -0.34, 0]}>
      <sphereGeometry args={[0.145, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      <meshStandardMaterial {...mat(P.fuchsia, { emissiveIntensity: 0.5 })} />
    </mesh>
    <mesh position={[0, 0.46, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.175, 0.022, 6, 20]} />
      <meshStandardMaterial {...mat(P.violet)} />
    </mesh>
  </group>
);

/* ----------------------------- Biologiya -------------------------------- */

export const DnaHelix = () => {
  const g = useRef(null);
  useFrame((_, d) => {
    if (g.current) g.current.rotation.y += d * 0.45;
  });

  const r = 0.28;
  const steps = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const t = i / 8;
        return { a: t * Math.PI * 2.1, y: (t - 0.5) * 1.35 };
      }),
    [],
  );

  return (
    <group ref={g}>
      {/* nukleotidlar - bitta instanced mesh (1 ta draw call) */}
      <Instances limit={18} range={18}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshStandardMaterial {...mat(P.green, { emissiveIntensity: 0.45 })} />
        {steps.map(({ a, y }, i) => (
          <Fragment key={i}>
            <Instance position={[Math.cos(a) * r, y, Math.sin(a) * r]} />
            <Instance
              position={[-Math.cos(a) * r, y, -Math.sin(a) * r]}
              color={P.light}
            />
          </Fragment>
        ))}
      </Instances>
      {/* zinapoyalar */}
      <Instances limit={9} range={9}>
        <cylinderGeometry args={[0.02, 0.02, r * 2, 6]} />
        <meshStandardMaterial {...mat(P.light, { emissiveIntensity: 0.22 })} />
        {steps.map(({ a, y }, i) => (
          <Instance key={i} position={[0, y, 0]} rotation={[0, -a, Math.PI / 2]} />
        ))}
      </Instances>
    </group>
  );
};

const ORGANELLES = [
  [0.22, 0.18, 0.12, 0.09],
  [-0.24, -0.1, 0.16, 0.07],
  [0.05, -0.26, -0.14, 0.08],
];

export const Cell = () => (
  <group>
    <mesh>
      <sphereGeometry args={[0.5, 18, 12]} />
      <meshStandardMaterial
        {...mat(P.green, {
          transparent: true,
          opacity: 0.24,
          emissiveIntensity: 0.16,
        })}
      />
    </mesh>
    <mesh>
      <sphereGeometry args={[0.505, 14, 10]} />
      <meshBasicMaterial color={P.green} wireframe transparent opacity={0.22} />
    </mesh>
    <mesh position={[0.04, 0.03, 0]}>
      <sphereGeometry args={[0.18, 14, 10]} />
      <meshStandardMaterial {...mat(P.purple, { emissiveIntensity: 0.5 })} />
    </mesh>
    {ORGANELLES.map(([x, y, z, r], i) => (
      <mesh key={i} position={[x, y, z]} scale={[1, 0.6, 1]}>
        <sphereGeometry args={[r, 10, 8]} />
        <meshStandardMaterial {...mat(P.light)} />
      </mesh>
    ))}
  </group>
);

const DENDRITES = [
  [0.52, 0.26, 0.1],
  [-0.46, 0.34, -0.12],
  [0.12, -0.5, 0.2],
  [-0.3, -0.3, 0.3],
  [0.34, 0.06, -0.42],
];

export const Neuron = () => {
  const arms = useMemo(
    () =>
      DENDRITES.map(([x, y, z]) => ({
        tip: [x, y, z],
        mid: [x / 2, y / 2, z / 2],
        len: Math.hypot(x, y, z),
        q: orient(x, y, z),
      })),
    [],
  );

  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.19, 14, 10]} />
        <meshStandardMaterial {...mat(P.fuchsia, { emissiveIntensity: 0.5 })} />
      </mesh>
      {arms.map(({ tip, mid, len, q }, i) => (
        <Fragment key={i}>
          <mesh position={mid} quaternion={q}>
            <cylinderGeometry args={[0.016, 0.034, len, 6]} />
            <meshStandardMaterial {...mat(P.violet, { emissiveIntensity: 0.22 })} />
          </mesh>
          <mesh position={tip}>
            <sphereGeometry args={[0.05, 8, 6]} />
            <meshStandardMaterial {...mat(P.light)} />
          </mesh>
        </Fragment>
      ))}
    </group>
  );
};

/* ------------------------------- Fizika --------------------------------- */

export const Planet = () => (
  <group rotation={[0.4, 0, 0.2]}>
    <mesh>
      <sphereGeometry args={[0.38, 20, 14]} />
      <meshStandardMaterial {...mat(P.purple)} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.6, 0.028, 8, 48]} />
      <meshStandardMaterial {...mat(P.light, { emissiveIntensity: 0.5 })} />
    </mesh>
  </group>
);

export const Wave = () => {
  const points = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const t = i / 15;
        return [(t - 0.5) * 1.7, Math.sin(t * Math.PI * 3) * 0.26, 0];
      }),
    [],
  );

  return (
    <Instances limit={16} range={16}>
      <sphereGeometry args={[0.07, 10, 8]} />
      <meshStandardMaterial {...mat(P.sky, { emissiveIntensity: 0.45 })} />
      {points.map((p, i) => (
        <Instance key={i} position={p} />
      ))}
    </Instances>
  );
};

/* ----------------------------- Elektronika ------------------------------ */

const PINS = [0, 1, 2, 3].flatMap((i) =>
  [-1, 1].map((side) => [-0.27 + i * 0.18, -0.02, side * 0.45]),
);

export const Chip = () => (
  <group rotation={[0.45, 0.3, 0]}>
    <mesh>
      <boxGeometry args={[0.72, 0.12, 0.72]} />
      <meshStandardMaterial {...mat(P.indigo, { emissiveIntensity: 0.28 })} />
    </mesh>
    <mesh position={[0, 0.075, 0]}>
      <boxGeometry args={[0.44, 0.04, 0.44]} />
      <meshStandardMaterial {...mat(P.light, { emissiveIntensity: 0.45 })} />
    </mesh>
    <Instances limit={8} range={8}>
      <boxGeometry args={[0.08, 0.045, 0.2]} />
      <meshStandardMaterial {...mat(P.violet, { emissiveIntensity: 0.35 })} />
      {PINS.map((p, i) => (
        <Instance key={i} position={p} />
      ))}
    </Instances>
  </group>
);

/* -------------------- Geografiya / atlas / tarix ------------------------ */

export const Globe = () => {
  const g = useRef(null);
  useFrame((_, d) => {
    if (g.current) g.current.rotation.y += d * 0.22;
  });

  return (
    <group rotation={[0.3, 0, 0.16]}>
      <group ref={g}>
        <mesh>
          <sphereGeometry args={[0.46, 20, 14]} />
          <meshStandardMaterial
            {...mat(P.indigo, {
              transparent: true,
              opacity: 0.55,
              emissiveIntensity: 0.22,
            })}
          />
        </mesh>
        {/* parallel va meridianlar */}
        <mesh>
          <sphereGeometry args={[0.465, 14, 9]} />
          <meshBasicMaterial color={P.light} wireframe transparent opacity={0.4} />
        </mesh>
        {/* joylashuv belgisi */}
        <group rotation={[0, -0.7, 0.6]}>
          <mesh position={[0, 0.56, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.06, 0.15, 8]} />
            <meshStandardMaterial {...mat(P.fuchsia, { emissiveIntensity: 0.6 })} />
          </mesh>
          <mesh position={[0, 0.66, 0]}>
            <sphereGeometry args={[0.055, 10, 8]} />
            <meshStandardMaterial {...mat(P.fuchsia, { emissiveIntensity: 0.6 })} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export const Compass = () => (
  <group rotation={[Math.PI / 2.5, 0, 0.2]}>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.42, 0.05, 8, 30]} />
      <meshStandardMaterial {...mat(P.amber, { emissiveIntensity: 0.35 })} />
    </mesh>
    <mesh>
      <cylinderGeometry args={[0.4, 0.4, 0.03, 24]} />
      <meshStandardMaterial
        {...mat(P.light, { transparent: true, opacity: 0.3, emissiveIntensity: 0.15 })}
      />
    </mesh>
    <mesh position={[0, 0.04, -0.14]}>
      <coneGeometry args={[0.07, 0.3, 6]} />
      <meshStandardMaterial {...mat(P.fuchsia, { emissiveIntensity: 0.55 })} />
    </mesh>
    <mesh position={[0, 0.04, 0.14]} rotation={[Math.PI, 0, 0]}>
      <coneGeometry args={[0.07, 0.3, 6]} />
      <meshStandardMaterial {...mat(P.light, { emissiveIntensity: 0.4 })} />
    </mesh>
  </group>
);

// Tarixiy yodgorlik peshtoqi (Registon uslubi): ustunlar + ravoq + gumbaz.
export const Arch = () => (
  <group>
    <mesh position={[-0.3, -0.16, 0]}>
      <boxGeometry args={[0.14, 0.68, 0.14]} />
      <meshStandardMaterial {...mat(P.amber, { emissiveIntensity: 0.28 })} />
    </mesh>
    <mesh position={[0.3, -0.16, 0]}>
      <boxGeometry args={[0.14, 0.68, 0.14]} />
      <meshStandardMaterial {...mat(P.amber, { emissiveIntensity: 0.28 })} />
    </mesh>
    <mesh position={[0, 0.18, 0]}>
      <torusGeometry args={[0.3, 0.07, 6, 20, Math.PI]} />
      <meshStandardMaterial {...mat(P.amber, { emissiveIntensity: 0.28 })} />
    </mesh>
    <mesh position={[0, -0.54, 0]}>
      <boxGeometry args={[0.86, 0.1, 0.3]} />
      <meshStandardMaterial {...mat(P.light, { emissiveIntensity: 0.25 })} />
    </mesh>
    <mesh position={[0, 0.24, 0]}>
      <sphereGeometry args={[0.19, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial {...mat(P.sky, { emissiveIntensity: 0.4 })} />
    </mesh>
  </group>
);

// Xarita qatlamlari - atlas bo'limiga ishora (bir-birining ustida suzuvchi varaqlar).
const MAP_LAYERS = [
  [0, P.violet, 0.5],
  [0.22, P.indigo, 0.42],
  [0.44, P.light, 0.34],
];

export const MapStack = () => (
  <group rotation={[-0.7, 0.5, 0.18]}>
    {MAP_LAYERS.map(([y, color, opacity], i) => (
      <mesh key={i} position={[i * 0.1, y, i * -0.07]}>
        <boxGeometry args={[0.95 - i * 0.12, 0.025, 0.66 - i * 0.09]} />
        <meshStandardMaterial
          {...mat(color, { transparent: true, opacity, emissiveIntensity: 0.35 })}
        />
      </mesh>
    ))}
    <mesh position={[0.2, 0.64, -0.14]}>
      <coneGeometry args={[0.07, 0.18, 8]} />
      <meshStandardMaterial {...mat(P.fuchsia, { emissiveIntensity: 0.6 })} />
    </mesh>
  </group>
);
