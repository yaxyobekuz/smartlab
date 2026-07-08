// 3D Arduino Uno board + breadboard. The active demo drives the LED / servo.
import { useRef } from "react";
import * as THREE from "three";
import { usePausableFrame } from "@/lab/components/usePausableFrame";

// Arduino Uno board: blue PCB with USB, power jack, chip and header pins.
const Board = () => (
  <group position={[-1.6, 0, 0]}>
    <mesh castShadow>
      <boxGeometry args={[3, 0.12, 2.1]} />
      <meshStandardMaterial color="#0f766e" roughness={0.6} metalness={0.1} />
    </mesh>
    {/* USB connector */}
    <mesh position={[-1.35, 0.22, 0.6]}>
      <boxGeometry args={[0.75, 0.4, 0.55]} />
      <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.3} />
    </mesh>
    {/* Power jack */}
    <mesh position={[-1.35, 0.18, -0.65]}>
      <boxGeometry args={[0.7, 0.35, 0.45]} />
      <meshStandardMaterial color="#111827" roughness={0.5} />
    </mesh>
    {/* Microcontroller chip */}
    <mesh position={[0.4, 0.14, 0]}>
      <boxGeometry args={[1, 0.14, 0.5]} />
      <meshStandardMaterial color="#1e293b" roughness={0.4} />
    </mesh>
    {/* Header pin rows */}
    {[0.85, -0.85].map((z) =>
      Array.from({ length: 10 }).map((_, i) => (
        <mesh key={`${z}-${i}`} position={[-1 + i * 0.22, 0.14, z]}>
          <boxGeometry args={[0.08, 0.12, 0.14]} />
          <meshStandardMaterial color="#0b0b0b" />
        </mesh>
      )),
    )}
  </group>
);

// Half-size breadboard the components sit on.
const Breadboard = () => (
  <group position={[1.9, -0.05, 0]}>
    <mesh>
      <boxGeometry args={[2.4, 0.2, 2.1]} />
      <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
    </mesh>
    {[0.5, -0.5].map((z) =>
      Array.from({ length: 12 }).map((_, i) => (
        <mesh key={`${z}-${i}`} position={[-1 + i * 0.18, 0.11, z]}>
          <boxGeometry args={[0.04, 0.02, 0.04]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      )),
    )}
  </group>
);

// Curved jumper wire between two points.
const Wire = ({ from, to, color }) => {
  const mid = [
    (from[0] + to[0]) / 2,
    Math.max(from[1], to[1]) + 0.5,
    (from[2] + to[2]) / 2,
  ];
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(...from),
    new THREE.Vector3(...mid),
    new THREE.Vector3(...to),
  ]);
  return (
    <mesh>
      <tubeGeometry args={[curve, 24, 0.03, 8, false]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
  );
};

// LED whose glow follows the demo type (blink / fade / rgb / button pulse).
const Led = ({ demo }) => {
  const matRef = useRef();
  const baseColor = new THREE.Color(demo.ledColor);

  usePausableFrame((state) => {
    const mat = matRef.current;
    if (!mat) return;
    const t = state.clock.elapsedTime / demo.interval;

    if (demo.type === "fade") {
      mat.emissiveIntensity = (Math.sin(t * Math.PI * 2) + 1) / 2;
      mat.emissive.copy(baseColor);
    } else if (demo.type === "rgb") {
      mat.emissive.setHSL((t * 0.3) % 1, 1, 0.5);
      mat.emissiveIntensity = 1.2;
    } else if (demo.type === "servo") {
      mat.emissive.copy(baseColor);
      mat.emissiveIntensity = 0.9;
    } else {
      // blink / button: sharp on-off
      const on = Math.sin(t * Math.PI * 2) > 0;
      mat.emissive.copy(baseColor);
      mat.emissiveIntensity = on ? 1.4 : 0.05;
    }
  });

  return (
    <group position={[1.6, 0.25, 0.4]}>
      <mesh position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial
          ref={matRef}
          color={demo.ledColor}
          emissive={demo.ledColor}
          emissiveIntensity={1}
          roughness={0.3}
        />
      </mesh>
      {/* legs */}
      {[-0.06, 0.06].map((x) => (
        <mesh key={x} position={[x, -0.05, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.35, 6]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

// Servo motor with an arm that sweeps 0-180 degrees.
const Servo = () => {
  const arm = useRef();
  usePausableFrame((state) => {
    const t = state.clock.elapsedTime;
    // ease back and forth across 180 degrees
    const angle = ((Math.sin(t) + 1) / 2) * Math.PI;
    if (arm.current) arm.current.rotation.y = angle;
  });
  return (
    <group position={[2.1, 0.2, -0.3]}>
      <mesh>
        <boxGeometry args={[0.7, 0.5, 0.4]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.5} />
      </mesh>
      <group ref={arm} position={[0, 0.3, 0]}>
        <mesh position={[0.35, 0, 0]}>
          <boxGeometry args={[0.7, 0.06, 0.1]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      </group>
    </group>
  );
};

// Push button for the button demo.
const Button = () => (
  <group position={[1.6, 0.2, -0.5]}>
    <mesh>
      <boxGeometry args={[0.4, 0.2, 0.4]} />
      <meshStandardMaterial color="#334155" />
    </mesh>
    <mesh position={[0, 0.16, 0]}>
      <cylinderGeometry args={[0.12, 0.12, 0.12, 20]} />
      <meshStandardMaterial color="#ef4444" roughness={0.4} />
    </mesh>
  </group>
);

const ArduinoModel = ({ demo }) => (
  <group position={[0, -0.3, 0]}>
    <Board />
    <Breadboard />
    <Led demo={demo} />
    {demo.type === "servo" && <Servo />}
    {demo.type === "button" && <Button />}

    {/* Signal + ground wires from board to breadboard */}
    <Wire from={[-0.15, 0.14, 0.85]} to={[1.6, 0.1, 0.4]} color="#ef4444" />
    <Wire from={[-0.15, 0.14, -0.85]} to={[1.6, 0.1, 0.6]} color="#0f172a" />

    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.4, -0.5, 0]} receiveShadow>
      <planeGeometry args={[9, 9]} />
      <meshStandardMaterial color="#e2e8f0" roughness={1} />
    </mesh>
  </group>
);

export default ArduinoModel;
