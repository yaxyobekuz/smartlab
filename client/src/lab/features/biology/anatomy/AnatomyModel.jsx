// Shared loader for human anatomy (Z-Anatomy) GLB models.
// The models are heavy (millions of triangles), so hover-picking uses a BVH to
// keep raycasting cheap, and pointer events are throttled to avoid per-frame work.
// Parts are named only by material (Bone, Muscles, Eye...) and many ship without
// color, so we tint each mesh by its material and show its Uzbek label on hover.
import { useEffect, useMemo, useRef, useState } from "react";
import { useGLTF, Center, Bounds, Bvh, Html } from "@react-three/drei";
import * as THREE from "three";
import { usePausableFrame } from "@/lab/components/usePausableFrame";
import { resolveMaterial } from "@/lab/data/anatomyMaterials";

const HOVER_COLOR = new THREE.Color("#22d3ee");
const HOVER_THROTTLE_MS = 60; // pick at most ~16x/sec, not every frame

const AnatomyModel = ({ url }) => {
  const group = useRef();
  const { scene } = useGLTF(url);
  const hoveredMesh = useRef(null);
  const lastMove = useRef(0);
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

  const handleMove = (e) => {
    e.stopPropagation();
    const now = performance.now();
    if (now - lastMove.current < HOVER_THROTTLE_MS) return;
    lastMove.current = now;

    const mesh = e.object;
    if (mesh === hoveredMesh.current) return; // same part: nothing to update
    highlight(mesh);
    // Pin the tooltip to the hit point once, not on every move (avoids re-renders).
    setTip(mesh.userData.label ? { label: mesh.userData.label, point: e.point.toArray() } : null);
  };

  const handleOut = (e) => {
    e.stopPropagation();
    highlight(null);
    setTip(null);
  };

  return (
    <>
      <group ref={group}>
        <Bounds fit clip observe margin={1.1}>
          <Center>
            {/* BVH makes raycasting on the multi-million-triangle model cheap. */}
            <Bvh firstHitOnly>
              <primitive
                object={model}
                onPointerMove={handleMove}
                onPointerOut={handleOut}
              />
            </Bvh>
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
