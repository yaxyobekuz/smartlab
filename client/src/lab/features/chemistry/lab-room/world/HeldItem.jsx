import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useSnap } from "@/shared/utils/snapStore";
import EquipmentModel from "../equipment/EquipmentModel";
import { BlobVisibleContext } from "../equipment/kit/blobContext";
import { bodyBounds, objectType } from "./objectTypes";

// Hand position in camera space: lower right, far enough to stay out of the near plane.
const handPose = (typeId) => {
  const { half, center } = bodyBounds(objectType(typeId).body);
  const size = Math.max(half[0], half[1], half[2]) * 2;
  const lying = half[0] > half[1] * 2.5;
  return {
    position: [0.2 + size * 0.15, -0.2 - center[1] - size * 0.25, -0.42 - size * 0.55],
    rotation: lying ? [0.25, -0.9, 0] : [0.08, -0.35, 0],
  };
};

const HeldItem = ({ world }) => {
  const { hotbar, activeSlot, objects } = useSnap(world.store);
  const groupRef = useRef(null);
  const heldId = hotbar[activeSlot];
  const held = heldId ? objects.find((o) => o.id === heldId) : null;

  // Runs after the player moved the camera (priority 0) and before the composer renders (1).
  useFrame(({ camera }) => {
    const group = groupRef.current;
    if (!group) return;
    group.position.copy(camera.position);
    group.quaternion.copy(camera.quaternion);
  }, 0.6);

  if (!held) return null;
  const pose = handPose(held.typeId);
  return (
    <group ref={groupRef}>
      <group position={pose.position} rotation={pose.rotation}>
        <BlobVisibleContext.Provider value={false}>
          <EquipmentModel key={held.id} id={held.typeId} {...held.props} />
        </BlobVisibleContext.Provider>
      </group>
    </group>
  );
};

export default HeldItem;
