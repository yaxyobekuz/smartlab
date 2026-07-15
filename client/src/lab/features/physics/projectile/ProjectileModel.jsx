// Real projectile motion: x = v0·cosθ·t, y = v0·sinθ·t − ½·g·t².
// The sphere loops over one flight time; the parabola is drawn as a drei Line.
import { useMemo, useRef } from "react";
import { Line } from "@react-three/drei";
import { usePausableFrame } from "@/lab/components/usePausableFrame";

// Launch point sits on the left; the whole trajectory is scaled to fit the scene.
const LAUNCH_X = -3;
const SPAN = 6;

const ProjectileModel = ({ v0, angleRad, g, range, height, flightTime }) => {
  const ball = useRef();

  // Scale physics metres -> scene units so range + apex stay inside the view.
  const scale = SPAN / Math.max(range, height * 1.4, 1);

  const points = useMemo(() => {
    const pts = [];
    const steps = 60;
    const T = flightTime > 0 ? flightTime : 0.001;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * T;
      const x = v0 * Math.cos(angleRad) * t;
      const y = v0 * Math.sin(angleRad) * t - 0.5 * g * t * t;
      pts.push([LAUNCH_X + x * scale, Math.max(y, 0) * scale, 0]);
    }
    return pts;
  }, [v0, angleRad, g, flightTime, scale]);

  const apex = [LAUNCH_X + (range / 2) * scale, height * scale, 0];

  usePausableFrame((state) => {
    if (!ball.current) return;
    const T = flightTime > 0 ? flightTime : 0.001;
    const t = state.clock.elapsedTime % T;
    const x = v0 * Math.cos(angleRad) * t;
    const y = v0 * Math.sin(angleRad) * t - 0.5 * g * t * t;
    ball.current.position.set(LAUNCH_X + x * scale, Math.max(y, 0) * scale, 0);
  });

  return (
    <group>
      {/* Yer sathi */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[16, 12]} />
        <meshStandardMaterial color="#1e293b" roughness={1} />
      </mesh>

      {/* To'p (og'ish burchagida qiya) */}
      <group position={[LAUNCH_X, 0, 0]} rotation={[0, 0, angleRad - Math.PI / 2]}>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.16, 0.22, 0.9, 20]} />
          <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.3, 24, 24]} />
          <meshStandardMaterial color="#475569" metalness={0.3} roughness={0.5} />
        </mesh>
      </group>

      {/* Traektoriya */}
      <Line points={points} color="#0189ff" lineWidth={2} dashed={false} />

      {/* Cho'qqi (maksimal balandlik) */}
      <mesh position={apex}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.6} />
      </mesh>

      {/* Snaryad */}
      <mesh ref={ball}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.2} />
        <pointLight color="#ef4444" intensity={6} distance={3} />
      </mesh>
    </group>
  );
};

export default ProjectileModel;
