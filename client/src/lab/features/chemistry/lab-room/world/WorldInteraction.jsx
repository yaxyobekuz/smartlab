import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useRapier } from "@react-three/rapier";
import { Raycaster, Vector2, Vector3 } from "three";
import { GROUPS } from "./groups";
import { bodyBounds, objectType } from "./objectTypes";
import { poseBounds, restPose } from "./poses";
import { PROMPTS } from "./prompts";

const REACH = 2.1;
const MENU_REACH = 4.5;
const MIN_UP = 0.85;

const tmpDir = new Vector3();
const tmpRight = new Vector3();
const raycaster = new Raycaster();
const ndc = new Vector2();

const footprintRadius = (body) => {
  const { half } = bodyBounds(body);
  return Math.max(half[0], half[2]);
};

// Frame-driven aiming, placement checks and the discrete actions (take, put down, drop, slots).
const WorldInteraction = ({ world, inputRef, activeRef }) => {
  const { world: physics, rapier } = useRapier();
  const camera = useThree((s) => s.camera);
  const markerRef = useRef(null);

  const queries = useMemo(() => {
    const objectIdOf = (collider) => collider?.parent()?.userData?.objectId ?? null;
    // One overlap-test shape per item type; building Rapier shapes every frame churns WASM memory.
    const shapes = new Map();
    const overlapShape = (typeId, half) => {
      if (!shapes.has(typeId)) shapes.set(typeId, new rapier.Cuboid(half[0] * 0.94, half[1] * 0.9, half[2] * 0.94));
      return shapes.get(typeId);
    };

    const placementAlong = (origin, direction, typeId, yaw, reach) => {
      const ray = new rapier.Ray(origin, direction);
      const hit = physics.castRayAndGetNormal(ray, reach, true, rapier.QueryFilterFlags.EXCLUDE_SENSORS, GROUPS.querySolids);
      if (!hit) return null;
      const point = ray.pointAt(hit.timeOfImpact);
      if (hit.normal.y < MIN_UP) return { valid: false, reason: "surface", point };
      const supportId = objectIdOf(hit.collider);
      if (supportId && !objectType(world.get(supportId)?.typeId ?? "")?.body.support) {
        return { valid: false, reason: "support", point };
      }
      const body = objectType(typeId).body;
      const pose = restPose(body, point, yaw);
      const { half, center, quaternion } = poseBounds(body, pose);
      const shape = overlapShape(typeId, half);
      let blocked = false;
      physics.intersectionsWithShape(
        { x: center.x, y: center.y + 0.003, z: center.z },
        { x: quaternion.x, y: quaternion.y, z: quaternion.z, w: quaternion.w },
        shape,
        () => {
          blocked = true;
          return false;
        },
        rapier.QueryFilterFlags.EXCLUDE_SENSORS,
        GROUPS.querySolids,
      );
      return { valid: !blocked, reason: blocked ? "blocked" : null, point, pose, supportId };
    };

    const objectAlong = (origin, direction) => {
      const ray = new rapier.Ray(origin, direction);
      const sensorHit = physics.castRay(ray, REACH, true, rapier.QueryFilterFlags.EXCLUDE_SOLIDS, GROUPS.querySensors);
      return sensorHit ? { objectId: objectIdOf(sensorHit.collider), distance: sensorHit.timeOfImpact } : null;
    };

    return { placementAlong, objectAlong };
  }, [physics, rapier, world]);

  // The cabinet menu drops items onto what is under the cursor.
  useEffect(() => {
    world.setQuery({
      placementFromScreen: (x, y, typeId) => {
        ndc.set(x, y);
        raycaster.setFromCamera(ndc, camera);
        const yaw = Math.atan2(-raycaster.ray.direction.x, -raycaster.ray.direction.z);
        return queries.placementAlong(raycaster.ray.origin, raycaster.ray.direction, typeId, yaw, MENU_REACH);
      },
    });
    return () => world.setQuery(null);
  }, [world, queries, camera]);

  useFrame(() => {
    const input = inputRef.current;
    const marker = markerRef.current;
    camera.getWorldDirection(tmpDir);
    const yaw = Math.atan2(-tmpDir.x, -tmpDir.z);
    // Rotating an item by the camera yaw turns its front (+Z) toward the player.
    const facePlayer = yaw;
    const held = world.activeObject();
    const drag = world.dragPreview;

    let placement = null;
    let focus = null;
    if (drag) {
      placement = world.query?.placementFromScreen(drag.x, drag.y, drag.typeId) ?? null;
      world.setDragResult(placement);
    } else if (activeRef.current) {
      if (held) placement = queries.placementAlong(camera.position, tmpDir, held.typeId, facePlayer, REACH);
      else focus = queries.objectAlong(camera.position, tmpDir);
    }

    const events = input.events.splice(0);
    if (activeRef.current) {
      for (const event of events) {
        if (event.type === "primary") {
          if (held && placement?.valid) world.placeHeld(held.id, placement.pose, placement.supportId);
          else if (held) world.flash(PROMPTS.reasons[placement?.reason ?? "far"]);
          else if (focus?.objectId) {
            const result = world.take(focus.objectId);
            if (!result.ok && result.reason) world.flash(PROMPTS.reasons[result.reason]);
          }
        } else if (event.type === "drop" && held) {
          tmpRight.set(-tmpDir.z, 0, tmpDir.x).normalize();
          const from = camera.position.clone().addScaledVector(tmpDir, 0.4).addScaledVector(tmpRight, 0.12);
          from.y -= 0.22;
          const body = objectType(held.typeId).body;
          world.dropHeld(
            held.id,
            { position: from.toArray(), rotation: body.lying ? [0, facePlayer, Math.PI / 2] : [0, facePlayer, 0] },
            [tmpDir.x * 1.1, tmpDir.y * 1.1 + 0.4, tmpDir.z * 1.1],
          );
        } else if (event.type === "slot") {
          world.selectSlot(event.slot);
        } else if (event.type === "wheel") {
          world.cycleSlot(event.direction);
        }
      }
    }

    const target = held ?? (drag ? { typeId: drag.typeId } : null);
    if (marker) {
      marker.visible = Boolean(target && placement?.point);
      if (marker.visible) {
        const radius = footprintRadius(objectType(target.typeId).body);
        marker.position.set(placement.point.x, placement.point.y + 0.002, placement.point.z);
        marker.scale.setScalar(radius + 0.01);
        marker.material.color.set(placement.valid ? "#34d399" : "#f87171");
      }
    }

    if (!activeRef.current || drag) world.setPrompt(null);
    else if (held) world.setPrompt(PROMPTS.holding(held, placement));
    else if (focus?.objectId) world.setPrompt(PROMPTS.focus(world.get(focus.objectId)));
    else world.setPrompt(null);
  }, 0.5);

  return (
    <mesh ref={markerRef} rotation-x={-Math.PI / 2} visible={false} renderOrder={6}>
      <ringGeometry args={[0.86, 1, 48]} />
      <meshBasicMaterial transparent opacity={0.75} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

export default WorldInteraction;
