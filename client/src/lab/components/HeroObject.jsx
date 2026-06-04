// Decorative rotating object for the landing hero.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

const HeroObject = () => {
  const group = useRef();

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.4;
      group.current.rotation.x += delta * 0.15;
    }
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.6, 0]} />
        <meshStandardMaterial
          color="#2563eb"
          roughness={0.25}
          metalness={0.4}
          flatShading
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[1.62, 0]} />
        <meshStandardMaterial color="#93c5fd" wireframe />
      </mesh>
    </group>
  );
};

export default HeroObject;
