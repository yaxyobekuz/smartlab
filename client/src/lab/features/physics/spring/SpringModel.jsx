// Real SHT: x(t) = x0·cos(ω·t), ω = √(k/m). The mass moves vertically and the
// helix spring stretches/compresses to follow it (top fixed, bottom on the mass).
import { useRef } from "react";
import { usePausableFrame } from "@/lab/components/usePausableFrame";

const TOP_Y = 3.4; // fixed anchor
const CENTER_Y = -1; // equilibrium position of the mass top
const COILS = 12;
const RADIUS = 0.5;
const POINTS = 220;

const SpringModel = ({ k, m, x0 }) => {
  const lineRef = useRef();
  const massRef = useRef();

  usePausableFrame((state) => {
    const omega = Math.sqrt(k / m); // rad/s
    const disp = x0 * Math.cos(omega * state.clock.elapsedTime);
    const massTop = CENTER_Y - disp; // downward positive displacement
    const springLen = TOP_Y - massTop;

    const geometry = lineRef.current?.geometry;
    if (geometry) {
      const arr = geometry.attributes.position.array;
      for (let i = 0; i <= POINTS; i++) {
        const t = i / POINTS;
        const angle = t * COILS * 2 * Math.PI;
        arr[i * 3] = Math.cos(angle) * RADIUS;
        arr[i * 3 + 1] = TOP_Y - t * springLen;
        arr[i * 3 + 2] = Math.sin(angle) * RADIUS;
      }
      geometry.attributes.position.needsUpdate = true;
    }

    if (massRef.current) massRef.current.position.y = massTop - 0.55;
  });

  return (
    <group>
      {/* fixed ceiling anchor */}
      <mesh position={[0, TOP_Y + 0.1, 0]}>
        <boxGeometry args={[2, 0.2, 2]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>

      {/* helix spring */}
      <line ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array((POINTS + 1) * 3), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#0189ff" />
      </line>

      {/* hanging mass */}
      <mesh ref={massRef} position={[0, CENTER_Y - 0.55, 0]}>
        <boxGeometry args={[1.1, 1.1, 1.1]} />
        <meshStandardMaterial color="#0189ff" roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  );
};

export default SpringModel;
