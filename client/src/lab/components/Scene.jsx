// Shared Canvas wrapper: consistent lighting, camera and orbit controls.
// Reads SceneControl context so the bottom toolbar can pause/reset the camera.
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, AdaptiveDpr } from "@react-three/drei";
import { useSceneControlOptional } from "./sceneControl";
import CardboardView from "./CardboardView";

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
  const { paused, controlsRef, cardboard } = useSceneControlOptional();

  // In cardboard mode the gyroscope drives the camera, so disable orbit + adaptive
  // dpr (CardboardView always renders) and stop auto-rotate.
  const cardboardOn = !!cardboard;

  return (
    <div className="relative h-full w-full">
      <Suspense fallback={<Loader />}>
        {/* Full-resolution rendering; perf comes from frameloop, not lower dpr. */}
        <Canvas
          frameloop={cardboardOn ? "always" : frameloop}
          camera={{ position: camera, fov: 50 }}
          dpr={[1, 2]}
        >
          {bg && <color attach="background" args={[bg]} />}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.1} />
          <directionalLight position={[-5, -3, -5]} intensity={0.4} />
          {children}

          <CardboardView enabled={cardboardOn} />

          {!cardboardOn && frameloop === "always" && <AdaptiveDpr pixelated />}
          {!cardboardOn && (
            <OrbitControls
              ref={controlsRef}
              enablePan={false}
              minDistance={3}
              maxDistance={40}
              autoRotate={autoRotate && !paused}
              autoRotateSpeed={0.8}
              regress={frameloop === "always"}
              {...controls}
            />
          )}
        </Canvas>
      </Suspense>
    </div>
  );
};

export default Scene;
