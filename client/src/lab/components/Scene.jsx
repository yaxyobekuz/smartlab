// Shared Canvas wrapper: consistent lighting, camera and orbit controls.
// Reads SceneControl context so the bottom toolbar can pause/reset the camera.
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useSceneControlOptional } from "./sceneControl";

const Loader = () => (
  <div className="absolute inset-0 grid place-items-center text-muted-foreground text-sm">
    Yuklanmoqda...
  </div>
);

const Scene = ({
  children,
  camera = [0, 0, 8],
  controls = {},
  bg,
  autoRotate = false,
}) => {
  const { paused, controlsRef } = useSceneControlOptional();

  return (
    <div className="relative h-full w-full">
      <Suspense fallback={<Loader />}>
        <Canvas camera={{ position: camera, fov: 50 }} dpr={[1, 2]}>
          {bg && <color attach="background" args={[bg]} />}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.1} />
          <directionalLight position={[-5, -3, -5]} intensity={0.4} />
          {children}
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            minDistance={3}
            maxDistance={40}
            autoRotate={autoRotate && !paused}
            autoRotateSpeed={0.8}
            {...controls}
          />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default Scene;
