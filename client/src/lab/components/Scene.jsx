// Shared Canvas wrapper: consistent lighting, camera and orbit controls.
// Reads SceneControl context so the bottom toolbar can pause/reset the camera.
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, AdaptiveDpr } from "@react-three/drei";
import { XR } from "@react-three/xr";
import { useSceneControlOptional } from "./sceneControl";

const Loader = () => (
  <div className="absolute inset-0 grid place-items-center text-muted-foreground text-sm">
    Yuklanmoqda...
  </div>
);

// frameloop="demand" renders only on change (camera move, invalidate) - use it
// for heavy static scenes (anatomy). Animated scenes keep the default "always".
const Scene = ({
  children,
  camera = [0, 0, 8],
  controls = {},
  bg,
  autoRotate = false,
  frameloop = "always",
}) => {
  const { paused, controlsRef, xrStore } = useSceneControlOptional();

  // Wrap in <XR> only when a store exists (workspace); the hero has no provider.
  const content = (
    <>
      {bg && <color attach="background" args={[bg]} />}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.1} />
      <directionalLight position={[-5, -3, -5]} intensity={0.4} />
      {children}
      {/* Drops resolution while orbiting (regress), restores it when idle. */}
      <AdaptiveDpr pixelated />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={3}
        maxDistance={40}
        autoRotate={autoRotate && !paused}
        autoRotateSpeed={0.8}
        regress
        {...controls}
      />
    </>
  );

  return (
    <div className="relative h-full w-full">
      <Suspense fallback={<Loader />}>
        {/* Full-resolution rendering; perf comes from frameloop, not lower dpr. */}
        <Canvas
          frameloop={frameloop}
          camera={{ position: camera, fov: 50 }}
          dpr={[1, 2]}
        >
          {xrStore ? <XR store={xrStore}>{content}</XR> : content}
        </Canvas>
      </Suspense>
    </div>
  );
};

export default Scene;
