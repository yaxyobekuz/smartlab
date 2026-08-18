// Hero fonidagi interaktiv 3D muhit: markazda (bola atrofida) orbita bo'ylab
// suzuvchi fan modellari, chekkalarda esa uzoq "fon qatlami". Sichqoncha bilan
// yengil parallaks. Hech qanday tashqi model yuklanmaydi.
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import usePointerRef from "./usePointerRef";
import {
  Arch,
  Atom,
  Cell,
  Chip,
  Compass,
  DnaHelix,
  Globe,
  MapStack,
  Molecule,
  Neuron,
  Planet,
  TestTube,
  Wave,
} from "./scienceModels";

// Markaziy orbita: modellar bola tasviri atrofida ellips bo'ylab aylanadi -
// chetga chiqib qirqilmaydi, faqat uni o'rab yuradi.
const ORBIT = [
  { M: Atom, rx: 2.5, rz: 1.5, y: 1.75, amp: 0.22, speed: 0.3, phase: 0, scale: 0.85, float: 1.3 },
  { M: Molecule, rx: 2.9, rz: 1.7, y: 1.2, amp: 0.24, speed: 0.26, phase: 2.1, scale: 0.9, float: 1.1 },
  { M: DnaHelix, rx: 2.4, rz: 1.5, y: 2.05, amp: 0.2, speed: 0.34, phase: 3.6, scale: 0.85, float: 1.2 },
  { M: Planet, rx: 2.2, rz: 1.7, y: 2.35, amp: 0.18, speed: 0.24, phase: 1.2, scale: 0.7, float: 1 },
  { M: TestTube, rx: 2.95, rz: 1.75, y: 1.55, amp: 0.26, speed: 0.29, phase: 4.6, scale: 0.85, float: 1.4 },
  { M: Cell, rx: 2.6, rz: 1.6, y: 0.95, amp: 0.22, speed: 0.32, phase: 5.4, scale: 0.72, float: 1.5 },
];

// Uzoq fon qatlami. Joylashuv ekranga nisbatan (fx, fy: -1..1 = chekkalar), shu
// sabab har qanday ekran o'lchamida burchaklarda qoladi va matnga tushmaydi.
const FIELD = [
  { M: MapStack, fx: -0.92, fy: 0.88, z: -5.2, scale: 0.9, dim: 0.4 },
  { M: Chip, fx: -1.0, fy: -0.95, z: -3.0, scale: 0.85, dim: 0.5 },
  { M: Neuron, fx: 0.42, fy: 0.95, z: -4.8, scale: 0.85, dim: 0.45 },
  { M: Compass, fx: 0.93, fy: 0.72, z: -3.9, scale: 0.85, dim: 0.5 },
  { M: Globe, fx: 0.96, fy: 0.05, z: -3.5, scale: 0.95, dim: 0.55 },
  { M: Wave, fx: 0.82, fy: -0.86, z: -3.2, scale: 0.85, dim: 0.55 },
  { M: Arch, fx: 0.06, fy: -1.02, z: -4.6, scale: 0.9, dim: 0.45 },
];

// Uzoqdagi modellarni xiralashtiradi. Har mesh o'z materialiga ega (JSX'da
// alohida yaratiladi), shuning uchun klon shart emas.
const Dim = ({ amount, children }) => {
  const g = useRef(null);

  useEffect(() => {
    g.current?.traverse((o) => {
      const m = o.material;
      if (!m) return;
      m.transparent = true;
      m.opacity = (m.opacity ?? 1) * amount;
      m.depthWrite = false;
    });
  }, [amount]);

  return <group ref={g}>{children}</group>;
};

// Fon modeli: ekran chekkasiga nisbatan joylashadi (kamera z=8 dan chuqurlikka
// qarab kenglik proporsional o'sadi).
const FieldItem = ({ M, fx, fy, z, scale, dim }) => {
  const g = useRef(null);
  const { viewport, camera } = useThree();

  useFrame(() => {
    if (!g.current) return;
    const depth = (camera.position.z - z) / camera.position.z;
    g.current.position.set(
      fx * viewport.width * 0.5 * depth,
      camera.position.y + fy * viewport.height * 0.5 * depth,
      z,
    );
  });

  return (
    <Dim amount={dim}>
      <group ref={g} scale={scale}>
        <Float speed={0.8} rotationIntensity={0.5} floatIntensity={0.7}>
          <M />
        </Float>
      </group>
    </Dim>
  );
};

const Orbiter = ({ M, rx, rz, y, amp, speed, phase, scale, float }) => {
  const g = useRef(null);

  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime * speed + phase;
    g.current.position.set(
      Math.cos(t) * rx,
      y + Math.sin(t * 0.8) * amp,
      Math.sin(t) * rz,
    );
  });

  return (
    <group ref={g}>
      <Float speed={float} rotationIntensity={0.7} floatIntensity={0.8}>
        <group scale={scale}>
          <M />
        </group>
      </Float>
    </group>
  );
};

// Orbita markazi bola tasviri ustiga suriladi: keng ekranda o'ngga, mobilda
// (ustun-ustun joylashuvda) pastga - shunda modellar matn ustidan o'tmaydi.
const OrbitCenter = ({ children }) => {
  const g = useRef(null);
  const { viewport, size } = useThree();

  useFrame(() => {
    if (!g.current) return;
    const wide = size.width >= 768;
    // 768px'da orbita kichik va o'ngroqda, 1280px+ da to'liq kattalikda - shunda
    // modellar hech qachon matn ustuniga kirib qolmaydi.
    const t = Math.min(Math.max((size.width - 768) / 512, 0), 1);
    const targetX = wide ? viewport.width * (0.32 - 0.1 * t) : 0;
    const targetY = wide ? 0 : -viewport.height * 0.38;
    g.current.position.x += (targetX - g.current.position.x) * 0.08;
    g.current.position.y += (targetY - g.current.position.y) * 0.08;
    g.current.scale.setScalar(wide ? 0.65 + 0.35 * t : 0.55);
  });

  return <group ref={g}>{children}</group>;
};

// Sichqoncha harakatiga juda yengil javob - "chuqurlik" hissi.
const Parallax = ({ pointer, children }) => {
  const g = useRef(null);

  useFrame(() => {
    const node = g.current;
    if (!node) return;
    const { x, y } = pointer.current;
    node.rotation.y += (x * 0.09 - node.rotation.y) * 0.04;
    node.rotation.x += (-y * 0.05 - node.rotation.x) * 0.04;
    node.position.x += (x * 0.3 - node.position.x) * 0.04;
    node.position.y += (-y * 0.18 - node.position.y) * 0.04;
  });

  return <group ref={g}>{children}</group>;
};

const HeroScene = ({ active = true, low = false }) => {
  const pointer = usePointerRef(!low);
  const orbit = useMemo(() => (low ? ORBIT.slice(0, 4) : ORBIT), [low]);
  // Mobilda uzoq fon qatlami baribir ekrandan tashqarida qoladi - butunlay o'chiramiz.
  const field = useMemo(() => (low ? [] : FIELD), [low]);

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={low ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, 0.8, 8], fov: 42 }}
      gl={{ antialias: !low, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4, 6]} intensity={1.2} color="#ede9fe" />
      <directionalLight position={[-5, -2, 2]} intensity={0.5} color="#a855f7" />
      <pointLight position={[0, 0.5, 3]} intensity={10} color="#c4b5fd" distance={16} />

      <Parallax pointer={pointer}>
        {field.map((item, i) => (
          <FieldItem key={`f${i}`} {...item} />
        ))}

        <OrbitCenter>
          {orbit.map((o, i) => (
            <Orbiter key={i} {...o} />
          ))}
          {!low && (
            <Sparkles
              count={36}
              scale={[8, 5, 4]}
              size={2.6}
              speed={0.25}
              color="#c4b5fd"
              opacity={0.55}
            />
          )}
        </OrbitCenter>
      </Parallax>
    </Canvas>
  );
};

export default HeroScene;
