// Shared loader for human anatomy (Z-Anatomy) GLB models.
// The models are heavy (millions of triangles), so picking uses a BVH to keep
// raycasting cheap, and pointer events are throttled to avoid per-frame work.
// Parts are named only by material (Bone, Muscles, Eye...) and many ship without
// color, so we tint each mesh by its material and, on click, surface its Uzbek
// detail to the parent (shown in the corner modal).
import { useEffect, useMemo, useRef } from "react";
import { useGLTF, Center, Bounds, Bvh } from "@react-three/drei";
import * as THREE from "three";
import { usePausableFrame } from "@/lab/components/usePausableFrame";
import { resolveMaterial } from "@/lab/data/anatomyMaterials";

const HOVER_COLOR = new THREE.Color("#22d3ee");
const HOVER_THROTTLE_MS = 60; // pick at most ~16x/sec, not every frame

const AnatomyModel = ({ url, onPick, frozen = false }) => {
  const group = useRef();
  const { scene } = useGLTF(url);
  const hoveredMesh = useRef(null);
  const lastMove = useRef(0);

  // Clone so two pages can show the same model without sharing mutated materials.
  const model = useMemo(() => scene.clone(true), [scene]);

  // Tint every mesh by its material name; store the resolved detail per mesh.
  useEffect(() => {
    model.traverse((child) => {
      if (!child.isMesh) return;
      const matName = Array.isArray(child.material)
        ? child.material[0]?.name
        : child.material?.name;
      const resolved = resolveMaterial(matName);
      child.userData.detail = resolved;
      child.material = new THREE.MeshStandardMaterial({
        color: resolved?.color || "#cfd8dc",
        roughness: 0.7,
        metalness: 0.05,
      });
      child.userData.baseColor = child.material.color.clone();
    });
  }, [model]);

  // Idle spin, paused while hovering or while a part's detail is open.
  usePausableFrame((_, delta) => {
    if (group.current && !hoveredMesh.current && !frozen)
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
    if (e.object === hoveredMesh.current) return; // same part: nothing to update
    highlight(e.object);
    document.body.style.cursor = e.object.userData.detail ? "pointer" : "default";
  };

  const handleOut = (e) => {
    e.stopPropagation();
    highlight(null);
    document.body.style.cursor = "default";
  };

  const handleClick = (e) => {
    e.stopPropagation();
    const detail = e.object.userData.detail;
    if (detail) onPick?.(detail);
  };

  return (
    <group ref={group}>
      <Bounds fit observe margin={1.1}>
        <Center>
          {/* BVH makes raycasting on the multi-million-triangle model cheap. */}
          <Bvh firstHitOnly>
            <primitive
              object={model}
              onPointerMove={handleMove}
              onPointerOut={handleOut}
              onClick={handleClick}
            />
          </Bvh>
        </Center>
      </Bounds>
    </group>
  );
};

export default AnatomyModel;
