// Olov — a layered additive flame (outer orange, inner yellow, hot blue core)
// that flickers via animated vertical scale + a flickering point light. Cones
// are open and use AdditiveBlending with depthWrite off so they glow and blend
// instead of looking like solid plastic. Each layer is anchored at its base so
// flicker stretches the tip, not the root.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Layer = ({ refObj, height, radius, color, opacity }) => (
  <group ref={refObj}>
    <mesh position={[0, height / 2, 0]}>
      <coneGeometry args={[radius, height, 24, 1, true]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  </group>
);

const Flame = ({ temperature = 1, paused = false, position = [0, 0, 0] }) => {
  const outer = useRef(null);
  const inner = useRef(null);
  const core = useRef(null);
  const light = useRef(null);

  useFrame((state) => {
    if (paused) return;
    const t = state.clock.elapsedTime;
    const base = 0.75 + temperature * 0.4;
    const flick = 1 + 0.09 * Math.sin(t * 22) + 0.05 * Math.sin(t * 37 + 1.3);
    const sway = 0.04 * Math.sin(t * 6);
    if (outer.current) {
      outer.current.scale.set(1, base * flick, 1);
      outer.current.rotation.z = sway;
    }
    if (inner.current) inner.current.scale.set(1, base * (0.9 + 0.12 * Math.sin(t * 28)), 1);
    if (core.current) core.current.scale.set(1, base * 0.8, 1);
    if (light.current)
      light.current.intensity = (1.6 + temperature * 2.4) * (0.9 + 0.12 * Math.sin(t * 30));
  });

  return (
    <group position={position}>
      <pointLight ref={light} color="#ff9b45" distance={3.2} decay={2} position={[0, 0.5, 0]} />
      <Layer refObj={outer} height={1.0} radius={0.17} color="#ff5a14" opacity={0.4} />
      <Layer refObj={inner} height={0.72} radius={0.1} color="#ffc24a" opacity={0.8} />
      <Layer refObj={core} height={0.46} radius={0.055} color="#bfe0ff" opacity={0.75} />
    </group>
  );
};

export default Flame;
