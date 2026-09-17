import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useSnap } from "@/shared/utils/snapStore";
import EquipmentModel from "../equipment/EquipmentModel";
import BodyColliders from "./BodyColliders";
import { objectType } from "./objectTypes";

const BREAK_SPEED = { glass: 2.4, porcelain: 3.2 };

const WorldObject = ({ object, world }) => {
  const bodyRef = useRef(null);
  const lastSpeed = useRef(0);
  const type = objectType(object.typeId);
  const dynamic = object.state === "dynamic";
  const breaks = type.body.breaks;

  // Collision callbacks run after the solver changed the velocity, so keep the pre-impact speed.
  useFrame(() => {
    const body = bodyRef.current;
    if (!dynamic || !breaks || !body) return;
    const v = body.linvel();
    lastSpeed.current = Math.hypot(v.x, v.y, v.z);
  });

  const onImpact = () => {
    const body = bodyRef.current;
    if (!body || lastSpeed.current < BREAK_SPEED[breaks]) return;
    const t = body.translation();
    const r = body.rotation();
    const v = body.linvel();
    queueMicrotask(() => world.shatter(object.id, [t.x, t.y, t.z], [r.x, r.y, r.z, r.w], [v.x, v.y, v.z]));
  };

  return (
    <RigidBody
      ref={bodyRef}
      type={dynamic ? "dynamic" : "fixed"}
      position={object.position}
      rotation={object.rotation}
      {...(dynamic ? { linearVelocity: object.velocity } : {})}
      colliders={false}
      ccd={dynamic}
      userData={{ objectId: object.id }}
      {...(dynamic && breaks ? { onCollisionEnter: onImpact } : {})}
    >
      <BodyColliders body={type.body} />
      <EquipmentModel id={object.typeId} simId={object.id} {...object.props} />
    </RigidBody>
  );
};

const WorldObjects = ({ world }) => {
  const { objects } = useSnap(world.store);
  return objects
    .filter((o) => o.state !== "held")
    .map((o) => <WorldObject key={`${o.id}:${o.state}:${o.rev}`} object={o} world={world} />);
};

export default WorldObjects;
