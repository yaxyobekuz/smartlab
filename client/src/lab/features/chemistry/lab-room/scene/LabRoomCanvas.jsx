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
import FxLab from "../sim/FxLab";
import EffectsBench from "../effects/EffectsBench";
import EquipmentLights from "../equipment/lighting/EquipmentLights";
import WorldSurfaces from "../world/WorldSurfaces";
import WorldObjects from "../world/WorldObjects";
import WorldInteraction from "../world/WorldInteraction";
import Shards from "../world/Shards";
import HeldItem from "../world/HeldItem";
import ThumbnailRenderer from "../world/ThumbnailRenderer";
import { LabContext } from "../sim/labContext";
import LabRunner from "../sim/LabRunner";
import ToolEffects from "../tools/ToolEffects";
import LabMonitor from "../hud/LabMonitor";

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
  lab,
  thumbs,
  inputRef,
  activeRef,
  settingsRef,
  poseRef,
  resetRef,
  teleportRef,
  fpsStore,
  debug,
  onReady,
  onMonitor,
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
        <KitProvider printScale={tier.printScale} quality={tierName}>
          <LabContext.Provider value={lab}>
            <Physics gravity={[0, -9.81, 0]} timeStep="vary">
              <RoomColliders boxes={manifest.boxes} debug={debug.colliders} />
              <Player
                meta={meta}
                inputRef={inputRef}
                activeRef={activeRef}
                settingsRef={settingsRef}
                poseRef={poseRef}
                resetRef={resetRef}
                teleportRef={teleportRef}
                eyeHeight={debug.eye}
              />
              {debug.effects ? (
                <EffectsBench spec={debug.effects} />
              ) : debug.fxlab ? (
                <FxLab spec={debug.fxlab} startAt={debug.t ?? 0} spacing={debug.spacing ?? undefined} />
              ) : debug.showcase ? (
                <EquipmentLayer showcase={debug.showcase} spacing={debug.spacing} />
              ) : (
                <>
                  <WorldSurfaces boxes={manifest.boxes} anchors={meta.anchors} />
                  <WorldObjects world={world} />
                  <Shards world={world} />
                  <WorldInteraction
                    world={world}
                    lab={lab}
                    inputRef={inputRef}
                    activeRef={activeRef}
                    monitor={meta.anchors?.monitor_screen}
                    onMonitor={onMonitor}
                  />
                  <LabRunner world={world} lab={lab} meta={meta} />
                  <ToolEffects lab={lab} />
                  <LabMonitor lab={lab} anchor={meta.anchors?.monitor_screen} />
                </>
              )}
            </Physics>
            <EquipmentLights anchors={meta.anchors} shadows={tier.effects} />
            <HeldItem world={world} lab={lab} />
            <ThumbnailRenderer thumbs={thumbs} />
          </LabContext.Provider>
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
