// Animated sine wave (moving point line) or a swinging pendulum.
import { useRef } from "react";
import { usePausableFrame } from "@/lab/components/usePausableFrame";

const SEGMENTS = 120;
const SPAN = 8;

const SineWave = ({ amplitude, frequency }) => {
  const ref = useRef();

  usePausableFrame((state) => {
    const geometry = ref.current?.geometry;
    if (!geometry) return;
    const arr = geometry.attributes.position.array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i <= SEGMENTS; i++) {
      const x = (i / SEGMENTS) * SPAN - SPAN / 2;
      arr[i * 3] = x;
      arr[i * 3 + 1] = Math.sin(x * frequency + t * 3) * amplitude;
      arr[i * 3 + 2] = 0;
    }
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <line ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array((SEGMENTS + 1) * 3), 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#0189ff" linewidth={2} />
    </line>
  );
};

const Pendulum = ({ amplitude, frequency }) => {
  const arm = useRef();
  const length = 3;

  usePausableFrame((state) => {
    const angle = Math.sin(state.clock.elapsedTime * frequency * 2) * amplitude;
    if (arm.current) arm.current.rotation.z = angle;
  });

  return (
    <group position={[0, 2.4, 0]}>
      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <group ref={arm}>
        <mesh position={[0, -length / 2, 0]}>
          <cylinderGeometry args={[0.03, 0.03, length, 8]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        <mesh position={[0, -length, 0]}>
          <sphereGeometry args={[0.45, 32, 32]} />
          <meshStandardMaterial color="#0189ff" roughness={0.3} metalness={0.2} />
        </mesh>
      </group>
    </group>
  );
};

const WaveModel = ({ wave }) =>
  wave.type === "pendulum" ? (
    <Pendulum amplitude={wave.amplitude} frequency={wave.frequency} />
  ) : (
    <SineWave amplitude={wave.amplitude} frequency={wave.frequency} />
  );

export default WaveModel;
