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
import WorldSurfaces from "../world/WorldSurfaces";
import WorldObjects from "../world/WorldObjects";
import WorldInteraction from "../world/WorldInteraction";
import Shards from "../world/Shards";
import HeldItem from "../world/HeldItem";
import ThumbnailRenderer from "../world/ThumbnailRenderer";

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
  live,
  world,
  thumbs,
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
      frameloop={live ? "always" : "demand"}
      gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
      shadows={tier.effects ? "percentage" : false}
      camera={{ fov: debug.fov ?? 70, near: 0.02, far: 80 }}
      onCreated={exposeRendererInDev}
    >
      <color attach="background" args={["#dfe6ee"]} />
      <Suspense fallback={null}>
        <KitProvider printScale={tier.printScale}>
          <Physics gravity={[0, -9.81, 0]} timeStep="vary">
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
            {debug.showcase ? (
              <EquipmentLayer showcase={debug.showcase} spacing={debug.spacing} />
            ) : (
              <>
                <WorldSurfaces boxes={manifest.boxes} anchors={meta.anchors} />
                <WorldObjects world={world} />
                <Shards world={world} />
                <WorldInteraction world={world} inputRef={inputRef} activeRef={activeRef} />
              </>
            )}
          </Physics>
          <EquipmentLights anchors={meta.anchors} shadows={tier.effects} />
          <HeldItem world={world} />
          <ThumbnailRenderer thumbs={thumbs} />
        </KitProvider>

        {placeholder ? (
          <PlaceholderRoom />
        ) : (
          <>
            <RoomModel lightmapKey={debug.lightmap ?? tier.lightmap} lightmapScale={meta.lightmapScale} />
            <RoomBackdrop url={ROOM_ASSETS.exterior} />
          </>
        )}
        <RoomEnvironment size={tier.envSize} />
        <RoomEffects high={tier.effects} />
        <FpsMeter store={fpsStore} />
        <ReadySignal onReady={onReady} />
      </Suspense>
    </Canvas>
  );
};

export default LabRoomCanvas;
