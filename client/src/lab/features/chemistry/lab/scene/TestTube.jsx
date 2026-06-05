// Probirka — a borosilicate test tube: a single LatheGeometry shell (rounded
// bottom, straight wall, slight rim) rendered as real glass via transmission,
// with a separate liquid column whose colour and height follow app state.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  TUBE_X,
  TUBE_BASE_Y,
  TUBE_HEIGHT,
  TUBE_OUTER_R,
  TUBE_INNER_R,
  TUBE_LIQUID_MAX,
} from "./labGeometry";

// Revolve a 2D outline around Y: rounded hemispherical bottom, then a straight
// wall up to a slightly flared rim.
const buildProfile = (radius, height, withRim) => {
  const pts = [];
  const steps = 12;
  for (let i = 0; i <= steps; i++) {
    const a = -Math.PI / 2 + (i / steps) * (Math.PI / 2);
    pts.push(new THREE.Vector2(radius * Math.cos(a), radius + radius * Math.sin(a)));
  }
  pts.push(new THREE.Vector2(radius, height - 0.06));
  if (withRim) {
    pts.push(new THREE.Vector2(radius + 0.025, height - 0.01));
    pts.push(new THREE.Vector2(radius + 0.025, height));
  } else {
    pts.push(new THREE.Vector2(radius, height));
  }
  return pts;
};

const Liquid = ({ color, fill }) => {
  const ref = useRef(null);
  const matRef = useRef(null);
  const current = useRef(0);
  const tint = useMemo(() => new THREE.Color(color), [color]);
  const profile = useMemo(
    () => buildProfile(TUBE_INNER_R, TUBE_LIQUID_MAX, false),
    [],
  );

  // Ease the fill height and lerp the colour for a smooth blend on every pour.
  useFrame((_, delta) => {
    current.current += (fill - current.current) * Math.min(1, delta * 3.4);
    const v = Math.max(0.0001, current.current);
    if (ref.current) {
      ref.current.scale.y = v;
      ref.current.visible = current.current > 0.004;
    }
    if (matRef.current) matRef.current.color.lerp(tint, Math.min(1, delta * 4));
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <latheGeometry args={[profile, 48]} />
      <meshStandardMaterial
        ref={matRef}
        color={color}
        roughness={0.22}
        metalness={0.0}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
};

const TestTube = ({ liquidColor, fill }) => {
  const profile = useMemo(
    () => buildProfile(TUBE_OUTER_R, TUBE_HEIGHT, true),
    [],
  );

  return (
    <group position={[TUBE_X, TUBE_BASE_Y, 0]}>
      <Liquid color={liquidColor} fill={fill} />

      {/* Real glass: high transmission + thickness + ior 1.5 gives refraction
          and soft reflections (needs the scene Environment to look right). */}
      <mesh>
        <latheGeometry args={[profile, 64]} />
        <meshPhysicalMaterial
          color="#f4f9ff"
          transmission={1}
          thickness={0.18}
          ior={1.45}
          roughness={0.04}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.06}
          envMapIntensity={1.8}
          specularIntensity={1}
          attenuationColor="#ffffff"
          attenuationDistance={4}
          transparent
          opacity={1}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export default TestTube;
