// Shared Canvas wrapper: consistent lighting, camera and orbit controls.
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const Loader = () => (
  <div className="absolute inset-0 grid place-items-center text-muted-foreground text-sm">
    Yuklanmoqda...
  </div>
);

const Scene = ({ children, camera = [0, 0, 8], controls = {} }) => (
  <div className="relative h-full w-full">
    <Suspense fallback={<Loader />}>
      <Canvas camera={{ position: camera, fov: 50 }} dpr={[1, 2]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.1} />
        <directionalLight position={[-5, -3, -5]} intensity={0.4} />
        {children}
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={40}
          {...controls}
        />
      </Canvas>
    </Suspense>
  </div>
);

export default Scene;
