// Bosh sahifa hero'si: bola atrofida ERKIN aylanib "uchib" yuruvchi 3D fan
// modellari (atom, molekula, kristall, DNK spiral, planeta). Har model bola
// markazi (0,0,0) atrofida o'z radiusi/balandligi/tezligi bilan ORBITA bo'ylab
// aylanadi - shu sabab hech qachon chetga chiqib qirqilmaydi, faqat bolani
// o'rab yuradi. Canvas butun hero kengligiga yoyilgan (LandingPage'da absolute).
// Binafsha (purple) palitra. Primitivlardan - yengil, GLB yo'q.
import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Icosahedron, Torus, TorusKnot, Sparkles } from "@react-three/drei";
import * as THREE from "three";

const C = {
  violet: "#8b5cf6",
  purple: "#a855f7",
  fuchsia: "#d946ef",
  indigo: "#6366f1",
  light: "#c4b5fd",
};

const glow = (color, extra = {}) => ({
  color,
  roughness: 0.25,
  metalness: 0.1,
  emissive: color,
  emissiveIntensity: 0.35,
  ...extra,
});

const Atom = () => {
  const g = useRef(null);
  useFrame((_, d) => {
    if (g.current) g.current.rotation.y += d * 0.6;
  });
  return (
    <group ref={g}>
      <Icosahedron args={[0.34, 1]}>
        <meshStandardMaterial {...glow(C.fuchsia, { emissiveIntensity: 0.6 })} />
      </Icosahedron>
      <Torus args={[0.7, 0.035, 12, 48]} rotation={[Math.PI / 2.3, 0, 0]}>
        <meshStandardMaterial {...glow(C.violet)} />
      </Torus>
      <Torus args={[0.7, 0.035, 12, 48]} rotation={[Math.PI / 2.3, Math.PI / 2.5, Math.PI / 3]}>
        <meshStandardMaterial {...glow(C.light)} />
      </Torus>
    </group>
  );
};

const Molecule = () => {
  const nodes = [
    [0, 0, 0, 0.26, C.purple],
    [0.45, 0.2, 0, 0.17, C.light],
    [-0.4, 0.25, 0.1, 0.17, C.fuchsia],
    [0.05, -0.45, 0.15, 0.17, C.indigo],
  ];
  return (
    <group>
      {nodes.map(([x, y, z, r, c], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 20, 20]} />
          <meshStandardMaterial {...glow(c)} />
        </mesh>
      ))}
      {nodes.slice(1).map(([x, y, z], i) => {
        const mid = new THREE.Vector3(x / 2, y / 2, z / 2);
        const len = Math.hypot(x, y, z);
        const q = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(x, y, z).normalize(),
        );
        return (
          <mesh key={`b${i}`} position={mid.toArray()} quaternion={q}>
            <cylinderGeometry args={[0.03, 0.03, len, 8]} />
            <meshStandardMaterial {...glow(C.light, { emissiveIntensity: 0.2 })} />
          </mesh>
        );
      })}
    </group>
  );
};

const Crystal = () => (
  <Icosahedron args={[0.5, 0]}>
    <meshStandardMaterial {...glow(C.indigo, { flatShading: true, emissiveIntensity: 0.5 })} />
  </Icosahedron>
);

const Helix = () => {
  const g = useRef(null);
  useFrame((_, d) => {
    if (g.current) g.current.rotation.z += d * 0.5;
  });
  return (
    <group ref={g}>
      <TorusKnot args={[0.36, 0.09, 90, 10, 2, 3]}>
        <meshStandardMaterial {...glow(C.fuchsia)} />
      </TorusKnot>
    </group>
  );
};

const Planet = () => (
  <group rotation={[0.4, 0, 0.2]}>
    <mesh>
      <sphereGeometry args={[0.4, 24, 24]} />
      <meshStandardMaterial {...glow(C.purple)} />
    </mesh>
    <Torus args={[0.62, 0.03, 12, 60]} rotation={[Math.PI / 2, 0, 0]}>
      <meshStandardMaterial {...glow(C.light, { emissiveIntensity: 0.5 })} />
    </Torus>
  </group>
);

// Bitta model bola markazi atrofida ellips orbita bo'ylab aylanadi. radius(x,z),
// balandlik(y) tebranadi; phase har modelni tarqatadi. Float ichida - qo'shimcha
// mayin suzish. Orbita radiusi Canvas frustumi ichida (kamera z=7, fov=42 =>
// ko'rinadigan yarim-eni ~2.7 * (dist)) - shuning uchun rx,rz ~2 xavfsiz.
const Orbiter = ({ Comp, rx, rz, y, yAmp, speed, phase, scale, float }) => {
  const g = useRef(null);
  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime * speed + phase;
    g.current.position.set(Math.cos(t) * rx, y + Math.sin(t * 0.8) * yAmp, Math.sin(t) * rz);
  });
  return (
    <group ref={g}>
      <Float speed={float} rotationIntensity={0.8} floatIntensity={0.9}>
        <group scale={scale}>
          <Comp />
        </group>
      </Float>
    </group>
  );
};

// Modellar bola BOSHINING TEPASIDA aylanadi - bola yuqoriga qaragani uchun
// (rasmda) ularni kuzatayotgandek ko'rinadi. Barcha y qiymatlari musbat (yuqori
// yarim sferada), rx>rz - ellips. Ba'zilari bola orqasidan o'tadi (chuqurlik).
const ORBITERS = [
  { Comp: Atom, rx: 2.5, rz: 1.5, y: 1.7, yAmp: 0.22, speed: 0.35, phase: 0.0, scale: 0.9, float: 1.4 },
  { Comp: Molecule, rx: 2.9, rz: 1.7, y: 1.3, yAmp: 0.25, speed: 0.3, phase: 2.1, scale: 0.95, float: 1.1 },
  { Comp: Crystal, rx: 2.4, rz: 1.4, y: 2.0, yAmp: 0.25, speed: 0.4, phase: 3.7, scale: 0.8, float: 1.6 },
  { Comp: Helix, rx: 2.8, rz: 1.6, y: 1.1, yAmp: 0.25, speed: 0.33, phase: 5.0, scale: 0.9, float: 1.2 },
  { Comp: Planet, rx: 2.2, rz: 1.7, y: 2.2, yAmp: 0.18, speed: 0.28, phase: 1.2, scale: 0.75, float: 1.0 },
  { Comp: Crystal, rx: 3.0, rz: 1.9, y: 1.5, yAmp: 0.3, speed: 0.45, phase: 4.4, scale: 0.48, float: 1.8 },
];

// Orbit markazini bolaga (o'ng ustunga) suradi. Desktopda bola o'ng yarimda
// bo'lgani uchun guruhni o'ngga suramiz; tor (mobil) ekranda markazda qoladi.
const CenterOnKid = ({ children }) => {
  const g = useRef(null);
  const { viewport, size } = useThree();
  useFrame(() => {
    if (!g.current) return;
    // Keng ekran (md+): markaz o'ngga ~viewport eni chorak; mobil: markazda.
    const wide = size.width >= 768;
    const targetX = wide ? viewport.width * 0.22 : 0;
    g.current.position.x += (targetX - g.current.position.x) * 0.1;
  });
  return <group ref={g}>{children}</group>;
};

const HeroFloatingScene = () => {
  const orbiters = useMemo(() => ORBITERS, []);
  return (
    <Canvas
      camera={{ position: [0, 1.0, 7.5], fov: 44 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} color="#ede9fe" />
      <directionalLight position={[-4, -2, 2]} intensity={0.6} color="#a855f7" />
      <pointLight position={[0, 0, 3]} intensity={12} color="#c4b5fd" distance={14} />

      <CenterOnKid>
        {orbiters.map((o, i) => (
          <Orbiter key={i} {...o} />
        ))}
        <Sparkles count={50} scale={[7, 6, 5]} size={3} speed={0.3} color="#c4b5fd" opacity={0.7} />
      </CenterOnKid>
    </Canvas>
  );
};

export default HeroFloatingScene;
