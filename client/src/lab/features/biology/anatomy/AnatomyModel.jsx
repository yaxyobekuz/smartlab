// Shared loader for human anatomy GLB models. Centers, scales to fit and
// slowly rotates the model. `url` comes from data/anatomy.js (one model per topic).
import { useRef } from "react";
import { useGLTF, Center, Bounds } from "@react-three/drei";
import { usePausableFrame } from "@/lab/components/usePausableFrame";

const AnatomyModel = ({ url }) => {
  const group = useRef();
  const { scene } = useGLTF(url);

  usePausableFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.3;
  });

  return (
    <group ref={group}>
      <Bounds fit clip observe margin={1.1}>
        <Center>
          <primitive object={scene} />
        </Center>
      </Bounds>
    </group>
  );
};

export default AnatomyModel;
