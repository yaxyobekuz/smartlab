// A glass beaker on a bench. Substances pour in as a coloured liquid: the level
// rises, the colour blends, bubbles drift up (faster when heated) and a burner
// glows underneath while heating. A short flash plays when a reaction fires.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePausableFrame } from "@/lab/components/usePausableFrame";

const BEAKER_HEIGHT = 2.0;
const INNER_RADIUS = 0.6;
const MAX_LIQUID_HEIGHT = 1.72;
const LIQUID_BOTTOM = 0.05;

// The glass beaker: tapered wall, base, rim and measuring lines.
const Beaker = () => {
  const gradMarks = [0.45, 0.8, 1.15, 1.5];
  return (
    <group>
      <mesh position={[0, BEAKER_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[0.72, 0.66, BEAKER_HEIGHT, 64, 1, true]} />
        <meshStandardMaterial
          color="#d3e4f5"
          transparent
          opacity={0.16}
          roughness={0.08}
          metalness={0.1}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.66, 0.66, 0.06, 64]} />
        <meshStandardMaterial color="#dbe8f5" transparent opacity={0.4} roughness={0.1} />
      </mesh>
      <mesh position={[0, BEAKER_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.72, 0.022, 14, 64]} />
        <meshStandardMaterial color="#f3f8fd" roughness={0.18} metalness={0.1} />
      </mesh>
      {gradMarks.map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.7 - (BEAKER_HEIGHT - y) * 0.03, 0.005, 8, 64]} />
          <meshStandardMaterial color="#9db8d4" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
};

// The liquid column — eases its height toward `fill` and lerps to its colour.
const Liquid = ({ color, fill }) => {
  const ref = useRef(null);
  const matRef = useRef(null);
  const current = useRef(0);
  const tint = useMemo(() => new THREE.Color(color), [color]);

  useFrame((_, delta) => {
    current.current += (fill - current.current) * Math.min(1, delta * 3.2);
    const h = Math.max(0.001, current.current * MAX_LIQUID_HEIGHT);
    if (ref.current) {
      ref.current.scale.y = h / MAX_LIQUID_HEIGHT;
      ref.current.position.y = LIQUID_BOTTOM + h / 2;
    }
    if (matRef.current) matRef.current.color.lerp(tint, Math.min(1, delta * 4));
  });

  return (
    <mesh ref={ref} position={[0, LIQUID_BOTTOM, 0]}>
      <cylinderGeometry args={[INNER_RADIUS, INNER_RADIUS, MAX_LIQUID_HEIGHT, 56]} />
      <meshStandardMaterial
        ref={matRef}
        color={color}
        transparent
        opacity={0.96}
        roughness={0.22}
        metalness={0.05}
      />
    </mesh>
  );
};

// Bubbles drifting up — gentle when cool, vigorous when boiling.
const Bubbles = ({ fill, temperature }) => {
  const meshes = useRef([]);
  const seeds = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        x: ((i % 3) - 1) * 0.28,
        z: (((i + 1) % 3) - 1) * 0.22,
        phase: i * 0.83,
        speed: 0.25 + 0.05 * (i % 4),
        r: 0.022 + 0.012 * (i % 3),
      })),
    [],
  );
  const top = Math.max(0.05, fill * MAX_LIQUID_HEIGHT);

  usePausableFrame((state) => {
    const t = state.clock.elapsedTime;
    const rate = 0.4 + temperature * 1.6;
    seeds.forEach((s, i) => {
      const mesh = meshes.current[i];
      if (!mesh) return;
      const y = ((t * s.speed * rate + s.phase) % 1) * top;
      mesh.position.set(s.x, LIQUID_BOTTOM + y, s.z);
      mesh.visible = fill > 0.02;
    });
  });

  return (
    <group>
      {seeds.map((s, i) => (
        <mesh key={i} ref={(m) => (meshes.current[i] = m)}>
          <sphereGeometry args={[s.r, 12, 12]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
};

// Burner glow under the vessel while heating.
const Burner = ({ heating, temperature }) => {
  const lightRef = useRef(null);
  useFrame(() => {
    if (lightRef.current)
      lightRef.current.intensity = heating ? 1.2 + temperature * 2.4 : 0;
  });
  return (
    <group position={[0, -0.18, 0]}>
      <pointLight ref={lightRef} color="#ff8a3d" distance={3} position={[0, 0.1, 0]} />
      {heating && (
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.45, 0.55, 0.12, 32]} />
          <meshStandardMaterial
            color="#ff7a2d"
            emissive="#ff7a2d"
            emissiveIntensity={0.6 + temperature}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}
    </group>
  );
};

// Brief light surge when a reaction fires (keyed on reactionSeq).
const ReactionFlash = ({ reactionSeq }) => {
  const lightRef = useRef(null);
  const energy = useRef(0);
  const lastSeq = useRef(reactionSeq);
  useFrame((_, delta) => {
    if (reactionSeq !== lastSeq.current) {
      lastSeq.current = reactionSeq;
      energy.current = 1;
    }
    energy.current = Math.max(0, energy.current - delta * 2);
    if (lightRef.current) lightRef.current.intensity = energy.current * 6;
  });
  return <pointLight ref={lightRef} color="#fff4d6" distance={6} position={[0, 1.3, 1]} />;
};

const BeakerModel = ({
  liquidColor,
  fill,
  heating,
  temperature,
  reactionSeq,
}) => (
  <group position={[0, -0.95, 0]}>
    {/* Bench */}
    <mesh position={[0, -0.12, 0]} receiveShadow>
      <cylinderGeometry args={[2.4, 2.4, 0.16, 48]} />
      <meshStandardMaterial color="#e7edf5" roughness={0.9} />
    </mesh>
    <Burner heating={heating} temperature={temperature} />
    <Beaker />
    <Liquid color={liquidColor} fill={fill} />
    <Bubbles fill={fill} temperature={temperature} />
    <ReactionFlash reactionSeq={reactionSeq} />
  </group>
);

export default BeakerModel;
