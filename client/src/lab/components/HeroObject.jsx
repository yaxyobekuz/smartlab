// Rotating flask lab GLTF model for the landing hero.
// The model ships as fully transparent glass (KHR_materials_transmission, alpha 0.25),
// which renders nearly invisible without an HDR environment. To stay robust offline,
// we override every mesh material with a visible, lightly tinted glass-like material.
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";
import flaskModelUrl from "@/shared/assets/models/flask-lab.glb?url";

const HeroObject = () => {
  const group = useRef();
  const { scene } = useGLTF(flaskModelUrl);

  useEffect(() => {
    scene.traverse((child) => {
      if (!child.isMesh) return;
      child.material = new THREE.MeshStandardMaterial({
        color: "#3b82f6",
        roughness: 1,
        metalness: 0.3,
        transparent: true,
        opacity: 0.8,
      });
    });
  }, [scene]);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={group} scale={10
      
    }>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
};

useGLTF.preload(flaskModelUrl);

export default HeroObject;
