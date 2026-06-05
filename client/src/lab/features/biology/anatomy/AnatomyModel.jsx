// Shared loader for human anatomy (Z-Anatomy) GLB models.
// Parts are named only by material (Bone, Muscles, Eye...) and many ship without
// color, so we tint each mesh by its material and, on click, surface its Uzbek
// detail to the parent (corner modal).
//
// Perf: the models are heavy (millions of triangles). The scene renders on demand
// (no idle spin), so a static view costs nothing. Raycasting uses a BVH built
// *after* first paint so picking is cheap without blocking the initial load.
import { useEffect, useMemo, useRef } from "react";
import { useGLTF, Center, Bounds } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { MeshBVH, acceleratedRaycast } from "three-mesh-bvh";
import * as THREE from "three";
import { resolveMaterial } from "@/lab/data/anatomyMaterials";

const HOVER_COLOR = new THREE.Color("#22d3ee");

const AnatomyModel = ({ url, onPick, frozen = false }) => {
  const { scene } = useGLTF(url);
  const invalidate = useThree((s) => s.invalidate);
  const selected = useRef(null);

  // Clone so the cached source scene is never mutated.
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
    invalidate();
  }, [model, invalidate]);

  // Build the raycast BVH off the critical path so first paint isn't blocked.
  useEffect(() => {
    const build = () => {
      model.traverse((child) => {
        if (child.isMesh && !child.geometry.boundsTree) {
          child.geometry.boundsTree = new MeshBVH(child.geometry);
          child.raycast = acceleratedRaycast;
        }
      });
    };
    const ric = window.requestIdleCallback;
    const id = ric ? ric(build) : setTimeout(build, 200);
    return () => (ric ? window.cancelIdleCallback(id) : clearTimeout(id));
  }, [model]);

  const restore = (mesh) => {
    if (!mesh?.userData.baseColor) return;
    mesh.material.color.copy(mesh.userData.baseColor);
    mesh.material.emissive.set("#000000");
  };

  // Clear the highlight when the detail modal is closed.
  useEffect(() => {
    if (!frozen && selected.current) {
      restore(selected.current);
      selected.current = null;
      invalidate();
    }
  }, [frozen, invalidate]);

  const handleClick = (e) => {
    e.stopPropagation();
    const mesh = e.object;
    const detail = mesh.userData.detail;
    if (!detail) return;
    restore(selected.current);
    selected.current = mesh;
    mesh.material.color.lerp(HOVER_COLOR, 0.45);
    mesh.material.emissive.copy(HOVER_COLOR).multiplyScalar(0.25);
    onPick?.(detail);
    invalidate();
  };

  return (
    <Bounds fit observe margin={1.1}>
      <Center>
        <primitive
          object={model}
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = e.object.userData.detail
              ? "pointer"
              : "default";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "default";
          }}
        />
      </Center>
    </Bounds>
  );
};

export default AnatomyModel;
