// Real physics: a traveling sine wave y = A·sin(kx − ωt), and a pendulum
// swinging by the small-angle law θ = θ₀·cos(√(g/L)·t).
import { useRef } from "react";
import { usePausableFrame } from "@/lab/components/usePausableFrame";

const SEGMENTS = 160;
const SPAN = 8;
const G = 9.81;

const SineWave = ({ amplitude, frequency, wavelength }) => {
  const ref = useRef();

  usePausableFrame((state) => {
    const geometry = ref.current?.geometry;
    if (!geometry) return;
    const arr = geometry.attributes.position.array;
    const t = state.clock.elapsedTime;
    const k = (2 * Math.PI) / wavelength; // wave number
    const w = 2 * Math.PI * frequency; // angular frequency
    for (let i = 0; i <= SEGMENTS; i++) {
      const x = (i / SEGMENTS) * SPAN - SPAN / 2;
      arr[i * 3] = x;
      arr[i * 3 + 1] = Math.sin(k * x - w * t) * amplitude;
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
      <lineBasicMaterial color="#0189ff" />
    </line>
  );
};

const Pendulum = ({ length, angle }) => {
  const arm = useRef();
  // Visual arm length tracks the real length (metres) but is clamped so it fits the scene.
  const armLen = Math.min(Math.max(length, 0.5), 3.5);

  usePausableFrame((state) => {
    const omega = Math.sqrt(G / length); // rad/s from the real period law
    const theta = angle * Math.cos(omega * state.clock.elapsedTime);
    if (arm.current) arm.current.rotation.z = theta;
  });

  return (
    <group position={[0, armLen / 2 + 0.6, 0]}>
      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <group ref={arm}>
        <mesh position={[0, -armLen / 2, 0]}>
          <cylinderGeometry args={[0.03, 0.03, armLen, 8]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        <mesh position={[0, -armLen, 0]}>
          <sphereGeometry args={[0.45, 32, 32]} />
          <meshStandardMaterial color="#0189ff" roughness={0.3} metalness={0.2} />
        </mesh>
      </group>
    </group>
  );
};

const WaveModel = ({ type, amplitude, frequency, wavelength, length, angle }) =>
  type === "pendulum" ? (
    <Pendulum length={length} angle={angle} />
  ) : (
    <SineWave amplitude={amplitude} frequency={frequency} wavelength={wavelength} />
  );

export default WaveModel;
