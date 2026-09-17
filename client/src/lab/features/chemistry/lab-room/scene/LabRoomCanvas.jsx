import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { TIERS } from "../labRoomSettings";
import { ROOM_ASSETS } from "../labRoomAssets";
import Player from "./Player";
import RoomColliders from "./RoomColliders";
import RoomModel from "./RoomModel";
import PlaceholderRoom from "./PlaceholderRoom";
import RoomEnvironment, { RoomBackdrop } from "./RoomEnvironment";
import RoomEffects from "./RoomEffects";
import KitProvider from "../equipment/kit/KitProvider";
import EquipmentLayer from "../equipment/EquipmentLayer";
import EquipmentLights from "../equipment/lighting/EquipmentLights";

const FPS_WINDOW = 0.5;

const exposeRendererInDev = ({ gl }) => {
  if (import.meta.env.DEV) window.__labRoomGl = gl;
};

const FpsMeter = ({ store }) => {
  const acc = useRef({ frames: 0, time: 0 });
  useFrame((_, delta) => {
    const a = acc.current;
    a.frames += 1;
    a.time += delta;
    if (a.time >= FPS_WINDOW) {
      store.set(Math.round(a.frames / a.time));
      a.frames = 0;
      a.time = 0;
    }
  });
  return null;
};

// Mounts only after every suspended sibling (models, textures, physics) has resolved.
const ReadySignal = ({ onReady }) => {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
};

const LabRoomCanvas = ({
  tierName,
  manifest,
  playing,
  inputRef,
  activeRef,
  settingsRef,
  poseRef,
  resetRef,
  fpsStore,
  debug,
  onReady,
}) => {
  const tier = TIERS[tierName];
  const { meta, placeholder } = manifest;

  return (
    <Canvas
      dpr={tier.dpr}
      frameloop={playing ? "always" : "demand"}
      gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
      shadows={tier.effects ? "percentage" : false}
      camera={{ fov: debug.fov ?? 70, near: 0.02, far: 80 }}
      onCreated={exposeRendererInDev}
    >
      <color attach="background" args={["#dfe6ee"]} />
      <Suspense fallback={null}>
        <Physics gravity={[0, 0, 0]} timeStep="vary">
          <RoomColliders boxes={manifest.boxes} debug={debug.colliders} />
          <Player
            meta={meta}
            inputRef={inputRef}
            activeRef={activeRef}
            settingsRef={settingsRef}
            poseRef={poseRef}
            resetRef={resetRef}
            eyeHeight={debug.eye}
          />
        </Physics>

        {placeholder ? (
          <PlaceholderRoom />
        ) : (
          <>
            <RoomModel lightmapKey={debug.lightmap ?? tier.lightmap} lightmapScale={meta.lightmapScale} />
            <RoomBackdrop url={ROOM_ASSETS.exterior} />
          </>
        )}
        <KitProvider>
          <EquipmentLights anchors={meta.anchors} shadows={tier.effects} />
          <EquipmentLayer showcase={debug.showcase} spacing={debug.spacing} />
        </KitProvider>
        <RoomEnvironment size={tier.envSize} />
        <RoomEffects high={tier.effects} />
        <FpsMeter store={fpsStore} />
        <ReadySignal onReady={onReady} />
      </Suspense>
    </Canvas>
  );
};

export default LabRoomCanvas;
