// Shared loader for human anatomy (Z-Anatomy) GLB models.
// The models name parts only by material (Bone, Muscles, Eye...) and many ship
// without color, so we: (1) tint every mesh by its material name, and
// (2) show the material's Uzbek label on hover, at the pointer position.
import { useEffect, useMemo, useRef, useState } from "react";
import { useGLTF, Center, Bounds, Html } from "@react-three/drei";
import * as THREE from "three";
import { usePausableFrame } from "@/lab/components/usePausableFrame";
import { resolveMaterial } from "@/lab/data/anatomyMaterials";

const HOVER_COLOR = new THREE.Color("#22d3ee");

const AnatomyModel = ({ url }) => {
  const group = useRef();
  const { scene } = useGLTF(url);
  const hoveredMesh = useRef(null);
  const [tip, setTip] = useState(null); // { label, point: [x,y,z] }

  // Clone so two pages can show the same model without sharing mutated materials.
  const model = useMemo(() => scene.clone(true), [scene]);

  // Tint every mesh by its material name; store the resolved label per mesh.
  useEffect(() => {
    model.traverse((child) => {
      if (!child.isMesh) return;
      const matName = Array.isArray(child.material)
        ? child.material[0]?.name
        : child.material?.name;
      const resolved = resolveMaterial(matName);
      child.userData.label = resolved?.label || null;
      child.material = new THREE.MeshStandardMaterial({
        color: resolved?.color || "#cfd8dc",
        roughness: 0.7,
        metalness: 0.05,
      });
      child.userData.baseColor = child.material.color.clone();
    });
  }, [model]);

  // Stop the idle spin while hovering so the user can read/aim at a part.
  usePausableFrame((_, delta) => {
    if (group.current && !hoveredMesh.current)
      group.current.rotation.y += delta * 0.3;
  });

  const highlight = (mesh) => {
    if (hoveredMesh.current === mesh) return;
    const prev = hoveredMesh.current;
    if (prev?.userData.baseColor) {
      prev.material.color.copy(prev.userData.baseColor);
      prev.material.emissive.set("#000000");
    }
    hoveredMesh.current = mesh;
    if (mesh) {
      mesh.material.color.lerp(HOVER_COLOR, 0.45);
      mesh.material.emissive.copy(HOVER_COLOR).multiplyScalar(0.25);
    }
  };

  return (
    <>
      <group ref={group}>
        <Bounds fit clip observe margin={1.1}>
          <Center>
            <primitive
              object={model}
              onPointerMove={(e) => {
                e.stopPropagation();
                highlight(e.object);
                const label = e.object.userData.label;
                if (label) setTip({ label, point: e.point.toArray() });
                else setTip(null);
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                highlight(null);
                setTip(null);
              }}
            />
          </Center>
        </Bounds>
      </group>

      {/* Tooltip lives outside the spinning group; e.point is in world space and
          the model is frozen while hovered, so it stays pinned to the part. */}
      {tip && (
        <Html position={tip.point} center distanceFactor={8} zIndexRange={[20, 0]}>
          <div className="pointer-events-none -translate-y-3 whitespace-nowrap rounded bg-foreground px-2 py-0.5 text-xs font-medium text-background shadow">
            {tip.label}
          </div>
        </Html>
      )}
    </>
  );
};

export default AnatomyModel;
