// Sahna ichidagi 3D boshqaruv paneli - VR kontrolleri nuri bilan (yoki desktopda
// sichqoncha bilan) bosib ishlatiladi. Reaktiv shishalarini idishga quyish,
// isitish (tortma kalit) va tozalash (cho'tkali 3D tugma) shu yerdan boshqariladi.
// Pointer (onClick) hodisalari @react-three/xr da kontroller "select" bilan ishlaydi.
import { useRef, useState } from "react";
import { Text, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SHELF_Z = 2.2;
const ROW_Y = 1.0;
const STEP = 0.5;

// Lerp maqsadlari - har kadrda yangi Color yaratmaslik uchun modul darajasida.
const HEAT_ON = new THREE.Color("#f97316");
const HEAT_OFF = new THREE.Color("#475569");
const GLOW_OFF = new THREE.Color("#0b1220");

const Label = ({ children, y = -0.36, size = 0.1, color = "#e6eefc" }) => (
  <Text
    position={[0, y, 0.02]}
    fontSize={size}
    color={color}
    anchorX="center"
    anchorY="top"
    maxWidth={0.62}
    textAlign="center"
    outlineWidth={0.004}
    outlineColor="#0b1220"
  >
    {children}
  </Text>
);

// Bitta reaktiv shishasi: bosilganda idishga quyiladi.
const Bottle = ({ reagent, x, onPour }) => {
  const [hover, setHover] = useState(false);
  return (
    <group
      position={[x, ROW_Y, SHELF_Z]}
      scale={hover ? 1.12 : 1}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        onPour?.(reagent);
      }}
    >
      {/* shisha */}
      <mesh>
        <cylinderGeometry args={[0.16, 0.16, 0.42, 24]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.18}
          roughness={0.1}
          transmission={0.6}
        />
      </mesh>
      {/* suyuqlik */}
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.24, 24]} />
        <meshStandardMaterial
          color={reagent.color}
          roughness={0.35}
          emissive={reagent.color}
          emissiveIntensity={hover ? 0.4 : 0.12}
        />
      </mesh>
      {/* tiqin */}
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.08, 24]} />
        <meshStandardMaterial color="#3b4252" roughness={0.6} />
      </mesh>
      <Label>{reagent.name}</Label>
    </group>
  );
};

// Isitishni yoqib/o'chiradigan tortma kalit: tugmacha chap (o'chiq) bilan o'ng
// (yoniq) orasida suriladi, yo'lakcha esa kulrangdan to'q sariqqa o'tadi.
const HeatSwitch = ({ x, on, onToggle }) => {
  const [hover, setHover] = useState(false);
  const knob = useRef(null);
  const track = useRef(null);

  useFrame((_, delta) => {
    const k = Math.min(1, delta * 12);
    if (knob.current)
      knob.current.position.x = THREE.MathUtils.lerp(knob.current.position.x, on ? 0.13 : -0.13, k);
    if (track.current) {
      track.current.color.lerp(on ? HEAT_ON : HEAT_OFF, k);
      track.current.emissive.lerp(on ? HEAT_ON : GLOW_OFF, k);
      track.current.emissiveIntensity = THREE.MathUtils.lerp(
        track.current.emissiveIntensity,
        on ? 0.6 : 0.05,
        k,
      );
    }
  });

  return (
    <group
      position={[x, ROW_Y, SHELF_Z]}
      scale={hover ? 1.08 : 1}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        onToggle?.();
      }}
    >
      {/* yo'lakcha */}
      <RoundedBox args={[0.52, 0.24, 0.16]} radius={0.11} smoothness={4}>
        <meshStandardMaterial ref={track} color="#475569" roughness={0.5} metalness={0.1} />
      </RoundedBox>
      {/* tugmacha */}
      <mesh ref={knob} position={[on ? 0.13 : -0.13, 0, 0.08]}>
        <sphereGeometry args={[0.1, 24, 24]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.25} metalness={0.05} />
      </mesh>
      <Label y={-0.3}>Isitish</Label>
    </group>
  );
};

// Cho'tka (supurgi) iconi - primitivlardan: qiya dasta + pastga yoyilgan tola.
const Broom = (props) => (
  <group rotation={[0, 0, 0.5]} {...props}>
    {/* dasta */}
    <mesh position={[0, 0.075, 0]}>
      <cylinderGeometry args={[0.012, 0.012, 0.2, 12]} />
      <meshStandardMaterial color="#c98a3c" roughness={0.6} />
    </mesh>
    {/* bog'lam */}
    <mesh position={[0, -0.03, 0]}>
      <cylinderGeometry args={[0.03, 0.03, 0.03, 12]} />
      <meshStandardMaterial color="#8a5a2b" roughness={0.7} />
    </mesh>
    {/* tola (bristles) */}
    <mesh position={[0, -0.1, 0]} scale={[1, 1, 0.6]}>
      <coneGeometry args={[0.075, 0.12, 16, 1, true]} />
      <meshStandardMaterial color="#f0c869" roughness={0.85} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

// Tozalash tugmasi: bosilganda ichkariga botadigan 3D tugma, ustida supurgi.
const CleanButton = ({ x, onClick }) => {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  const cap = useRef(null);

  useFrame((_, delta) => {
    if (!cap.current) return;
    const target = pressed ? -0.06 : 0;
    cap.current.position.z = THREE.MathUtils.lerp(cap.current.position.z, target, Math.min(1, delta * 18));
  });

  return (
    <group
      position={[x, ROW_Y, SHELF_Z]}
      scale={hover ? 1.08 : 1}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => {
        setHover(false);
        setPressed(false);
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        setPressed(true);
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        setPressed(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* uy (housing) */}
      <RoundedBox args={[0.42, 0.42, 0.14]} radius={0.07} smoothness={4} position={[0, 0, -0.05]}>
        <meshStandardMaterial color="#16202f" roughness={0.7} metalness={0.2} />
      </RoundedBox>
      {/* boshatadigan qopqoq + supurgi */}
      <group ref={cap} position={[0, 0, 0.08]}>
        <RoundedBox args={[0.34, 0.34, 0.12]} radius={0.06} smoothness={4}>
          <meshStandardMaterial
            color={hover ? "#14b8a6" : "#0d9488"}
            roughness={0.4}
            metalness={0.1}
            emissive="#0f766e"
            emissiveIntensity={hover ? 0.4 : 0.15}
          />
        </RoundedBox>
        <Broom position={[0, 0, 0.09]} scale={0.85} />
      </group>
      <Label y={-0.3}>Tozalash</Label>
    </group>
  );
};

const LabControls3D = ({ reagents = [], onPour, heating, onToggleHeat, onClear }) => {
  const n = reagents.length;
  return (
    <group>
      {/* javon taxtasi */}
      <mesh position={[0, ROW_Y - 0.26, SHELF_Z]}>
        <boxGeometry args={[4.4, 0.08, 0.6]} />
        <meshStandardMaterial color="#1b2436" roughness={0.7} metalness={0.2} />
      </mesh>

      {reagents.map((r, i) => (
        <Bottle
          key={r.id}
          reagent={r}
          x={(i - (n - 1) / 2) * STEP}
          onPour={onPour}
        />
      ))}

      <HeatSwitch x={-2.0} on={heating} onToggle={onToggleHeat} />
      <CleanButton x={2.0} onClick={onClear} />
    </group>
  );
};

export default LabControls3D;
