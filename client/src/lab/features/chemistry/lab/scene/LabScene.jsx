// The full 3D laboratory: a test tube clamped to a retort stand with a burner
// beneath it. Uses a dedicated Canvas so it can have studio image-based
// lighting (Lightformer Environment - offline-safe, no HDRI download) for real
// glass reflections, plus soft contact shadows for grounding. Camera/animation
// pause + reset are wired to the workspace toolbar via SceneControl.
import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Lightformer,
  ContactShadows,
} from "@react-three/drei";
import { XR, XROrigin, IfInSessionMode } from "@react-three/xr";
import { useSceneControlOptional } from "@/lab/components/sceneControl";
import CardboardView from "@/lab/components/CardboardView";
import Locomotion from "@/lab/components/Locomotion";
import XRLocomotion from "@/lab/components/XRLocomotion";
import ReactionBurst from "./ReactionBurst";
import LabControls3D from "./LabControls3D";
import RetortStand from "./RetortStand";
import Clamp from "./Clamp";
import TestTube from "./TestTube";
import Burner from "./Burner";
import Flame from "./Flame";
import Bubbles from "./Bubbles";
import Steam from "./Steam";
import PourDrop from "./PourDrop";
import Fog from "./Fog";
import {
  CAMERA_POSITION,
  CAMERA_TARGET,
  FLAME_Y,
  TUBE_X,
} from "./labGeometry";

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

const Apparatus = ({
  liquidColor,
  fill,
  heating,
  temperature,
  reactionSeq,
  reactionKind,
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
    {/* Steam only once there's enough liquid AND it's genuinely hot - so a fresh
        pour doesn't puff vapour out of a near-empty tube. */}
    <Steam active={heating && fill > 0.12 && temperature > 0.5} temperature={temperature} paused={paused} />
    <Fog active={fogging} paused={paused} />
    <PourDrop pourSeq={pourSeq} pourColor={pourColor} fill={fill} paused={paused} />
    <ReactionBurst reactionSeq={reactionSeq} kind={reactionKind} />
  </group>
);

// reagents/onPour/onToggleHeat/onClear drive the in-scene 3D controls (VR + mouse);
// the rest of the props are display state passed through to the apparatus.
const LabScene = ({ reagents, onPour, onToggleHeat, onClear, ...display }) => {
  const { paused, controlsRef, xrStore, inVR, cardboard, walk } =
    useSceneControlOptional();
  const originRef = useRef(null);

  // OrbitControls only in plain mode; VR/cardboard/walk drive the camera themselves.
  const freeControl = inVR || cardboard || walk;

  const content = (
    <>
      <color attach="background" args={["#0e1626"]} />
      <StudioEnv />
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 7, 4]} intensity={1.1} />
      <directionalLight position={[-5, 3, -4]} intensity={0.4} color="#bcd2ff" />

      <Apparatus {...display} paused={paused} />

      <LabControls3D
        reagents={reagents}
        onPour={onPour}
        heating={display.heating}
        onToggleHeat={onToggleHeat}
        onClear={onClear}
      />

      <ContactShadows
        position={[0, 0.005, 0]}
        opacity={0.55}
        blur={2.6}
        far={6}
        scale={11}
        resolution={1024}
        color="#0a1018"
      />

      {/* Desktop/phone walk (XR stik bilan harakat alohida <XRLocomotion> da). */}
      <Locomotion />

      {/* Turish nuqtasi HAR DOIM mavjud: sessiya boshlanishi bilan WebXR kamerasi
          shu guruhga ulanadi. inVR holatini kutsak, kamera (0,0,0) da qolib,
          probiraga emas, bo'shliqqa qarab ekran bo'sh ko'rinardi (asosiy bug). */}
      <XROrigin ref={originRef} position={[0, 0, 4.8]} />

      {/* Immersiv sessiyada kamera WebXR ixtiyorida bo'ladi - OrbitControls va
          cardboard stereo unga qarshi ishlab ekranni "buzmasligi" uchun ularni
          sessiya tashqarisiga qulflaymiz (react-three/xr rasmiy tavsiyasi). */}
      <IfInSessionMode deny={["immersive-vr", "immersive-ar"]}>
        <CardboardView enabled={!!cardboard && !inVR} />
        {!freeControl && (
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
        )}
      </IfInSessionMode>
    </>
  );

  return (
    <div className="relative h-full w-full">
      <Suspense fallback={<Loader />}>
        <Canvas dpr={[1, 2]} gl={{ antialias: true }} camera={{ position: CAMERA_POSITION, fov: 42 }}>
          {/* Wrap in <XR> so the lab can run a WebXR immersive-vr session;
              XRLocomotion (thumbstick) must live inside <XR>. */}
          {xrStore ? (
            <XR store={xrStore}>
              {content}
              <XRLocomotion originRef={originRef} />
            </XR>
          ) : (
            content
          )}
        </Canvas>
      </Suspense>
    </div>
  );
};

export default LabScene;
