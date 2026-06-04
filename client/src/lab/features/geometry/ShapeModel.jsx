// Rotating 3D geometry shape with a wireframe overlay. `kind` picks the geometry.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

const Geometry = ({ kind }) => {
  switch (kind) {
    case "sphere":
      return <sphereGeometry args={[1.3, 48, 48]} />;
    case "cylinder":
      return <cylinderGeometry args={[1, 1, 2, 48]} />;
    case "cone":
      return <coneGeometry args={[1.2, 2.2, 48]} />;
    case "pyramid":
      return <coneGeometry args={[1.4, 2.2, 4]} />;
    case "box":
    default:
      return <boxGeometry args={[1.8, 1.8, 1.8]} />;
  }
};

const ShapeModel = ({ shape }) => {
  const group = useRef();
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.4;
  });

  return (
    <group ref={group}>
      <mesh>
        <Geometry kind={shape.kind} />
        <meshStandardMaterial
          color={shape.color}
          roughness={0.35}
          metalness={0.15}
          transparent
          opacity={0.92}
        />
      </mesh>
      <mesh>
        <Geometry kind={shape.kind} />
        <meshStandardMaterial color="#ffffff" wireframe opacity={0.25} transparent />
      </mesh>
    </group>
  );
};

export default ShapeModel;
