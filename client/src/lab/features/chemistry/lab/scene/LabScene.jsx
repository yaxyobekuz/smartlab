// The full 3D laboratory: a test tube clamped to a retort stand with a burner
// beneath it. Uses a dedicated Canvas so it can have studio image-based
// lighting (Lightformer Environment - offline-safe, no HDRI download) for real
// glass reflections, plus soft contact shadows for grounding. Camera/animation
// pause + reset are wired to the workspace toolbar via SceneControl.
import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Lightformer,
  ContactShadows,
} from "@react-three/drei";
import { useSceneControlOptional } from "@/lab/components/sceneControl";
import RetortStand from "./RetortStand";
import Clamp from "./Clamp";
import TestTube from "./TestTube";
import Burner from "./Burner";
import Flame from "./Flame";
import Bubbles from "./Bubbles";
import Steam from "./Steam";
import PourDrop from "./PourDrop";
import Fog from "./Fog";
import { CAMERA_POSITION, CAMERA_TARGET, FLAME_Y, TUBE_X } from "./labGeometry";

const Loader = () => (
  <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
    Yuklanmoqda...
  </div>
);

// In-memory studio environment: three soft area lights give the glass clean
// reflections and a sense of depth without fetching any external HDRI.
const StudioEnv = () => (
  <Environment resolution={256}>
    <Lightformer form="rect" intensity={3} position={[0, 5, 3]} scale={[8, 3, 1]} color="#ffffff" />
    <Lightformer form="rect" intensity={2} position={[-5, 2, 1]} scale={[5, 6, 1]} color="#dbe6ff" />
    <Lightformer form="rect" intensity={2} position={[5, 2, 2]} scale={[4, 5, 1]} color="#fff0dc" />
    {/* Bright panel BEHIND the apparatus so the glass refracts light, not a black void */}
    <Lightformer form="rect" intensity={2.6} position={[0, 3, -5]} scale={[9, 7, 1]} color="#cfe0ff" />
  </Environment>
);

// A brief, contained pop when a strong reaction fires (keyed on reactionSeq).
const ReactionFlash = ({ reactionSeq }) => {
  const light = useRef(null);
  const puff = useRef(null);
  const mat = useRef(null);
  const energy = useRef(0);
  const last = useRef(reactionSeq);

  useFrame((_, delta) => {
    if (reactionSeq !== last.current) {
      last.current = reactionSeq;
      energy.current = 1;
    }
    energy.current = Math.max(0, energy.current - delta * 1.8);
    const e = energy.current;
    if (light.current) light.current.intensity = e * 7;
    if (puff.current) {
      const s = 0.2 + (1 - e) * 0.9;
      puff.current.scale.setScalar(s * (e > 0 ? 1 : 0));
      puff.current.visible = e > 0.01;
    }
    if (mat.current) mat.current.opacity = e * 0.5;
  });

  return (
    <group position={[TUBE_X, 1.5, 0]}>
      <pointLight ref={light} color="#fff3d0" distance={6} decay={2} intensity={0} />
      <mesh ref={puff} visible={false}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshBasicMaterial ref={mat} color="#fff6e0" transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
};

const Apparatus = ({
  liquidColor,
  fill,
  heating,
  temperature,
  reactionSeq,
  pourSeq,
  pourColor,
  fogging,
  paused,
}) => (
  <group>
    <RetortStand />
    <Clamp />
    <TestTube liquidColor={liquidColor} fill={fill} />
    <Burner />
    {heating && <Flame position={[TUBE_X, FLAME_Y, 0]} temperature={temperature} paused={paused} />}
    <Bubbles active={heating && fill > 0.02} fill={fill} temperature={temperature} paused={paused} />
    <Steam active={heating && temperature > 0.25} temperature={temperature} paused={paused} />
    <Fog active={fogging} paused={paused} />
    <PourDrop pourSeq={pourSeq} pourColor={pourColor} fill={fill} paused={paused} />
    <ReactionFlash reactionSeq={reactionSeq} />
  </group>
);

const LabScene = (props) => {
  const { paused, controlsRef } = useSceneControlOptional();

  return (
    <div className="relative h-full w-full">
      <Suspense fallback={<Loader />}>
        <Canvas dpr={[1, 2]} gl={{ antialias: true }} camera={{ position: CAMERA_POSITION, fov: 42 }}>
          <color attach="background" args={["#0e1626"]} />
          <StudioEnv />
          <ambientLight intensity={0.4} />
          <directionalLight position={[4, 7, 4]} intensity={1.1} />
          <directionalLight position={[-5, 3, -4]} intensity={0.4} color="#bcd2ff" />

          <Apparatus {...props} paused={paused} />

          <ContactShadows
            position={[0, 0.005, 0]}
            opacity={0.55}
            blur={2.6}
            far={6}
            scale={11}
            resolution={1024}
            color="#0a1018"
          />
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            target={CAMERA_TARGET}
            minDistance={3}
            maxDistance={13}
            maxPolarAngle={Math.PI * 0.52}
          />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default LabScene;
