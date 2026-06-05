// Ball-and-stick molecule. Atoms are spheres, bonds are cylinders between them.
import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { ELEMENTS } from "@/lab/data/molecules";

const Bond = ({ start, end }) => {
  const ref = useRef();
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...start);
    const b = new THREE.Vector3(...end);
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize(),
    );
    return { position: mid, quaternion: quat, length: len };
  }, [start, end]);

  return (
    <mesh ref={ref} position={position} quaternion={quaternion}>
      <cylinderGeometry args={[0.08, 0.08, length, 16]} />
      <meshStandardMaterial color="#9ca3af" roughness={0.5} />
    </mesh>
  );
};

const Atom = ({ el, pos }) => {
  const [hover, setHover] = useState(false);
  const meta = ELEMENTS[el];

  return (
    <group position={pos}>
      <mesh
        scale={hover ? 1.15 : 1}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
      >
        <sphereGeometry args={[meta.radius, 32, 32]} />
        <meshStandardMaterial
          color={meta.color}
          roughness={0.3}
          metalness={0.1}
          emissive={hover ? meta.color : "#000000"}
          emissiveIntensity={hover ? 0.3 : 0}
        />
      </mesh>
      {hover && (
        <Html center distanceFactor={8} className="pointer-events-none">
          <div className="whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background">
            {meta.name} ({el})
          </div>
        </Html>
      )}
    </group>
  );
};

const MoleculeModel = ({ molecule }) => {
  const group = useRef();
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.25;
  });

  return (
    <group ref={group}>
      {molecule.bonds.map(([i, j], idx) => (
        <Bond
          key={idx}
          start={molecule.atoms[i].pos}
          end={molecule.atoms[j].pos}
        />
      ))}
      {molecule.atoms.map((a, idx) => (
        <Atom key={idx} el={a.el} pos={a.pos} />
      ))}
    </group>
  );
};

export default MoleculeModel;
