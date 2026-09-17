import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { ROOM_ASSETS } from "../labRoomAssets";
import { applyLightmap, dressSurfaces, prepareRoom, setupLightmap } from "./roomMaterials";

const CLOCK_TICK_MS = 20000;

const RoomModel = ({ lightmapKey, lightmapScale }) => {
  const gltf = useGLTF(ROOM_ASSETS.glb);
  const lightmap = useTexture(ROOM_ASSETS.lightmap[lightmapKey]);
  const invalidate = useThree((s) => s.invalidate);
  const surfaces = useRef(null);
  const room = useMemo(() => prepareRoom(gltf.scene), [gltf.scene]);

  // Layout effect: materials must be final before the environment capture and the first frame.
  useLayoutEffect(() => {
    setupLightmap(lightmap);
    applyLightmap(room, lightmap, lightmapScale);
    const dressed = dressSurfaces(room, lightmap, lightmapScale);
    surfaces.current = dressed;
    return () => {
      dressed.dispose();
      surfaces.current = null;
    };
  }, [room, lightmap, lightmapScale]);

  useEffect(() => {
    const timer = setInterval(() => {
      surfaces.current?.tick();
      invalidate();
    }, CLOCK_TICK_MS);
    return () => clearInterval(timer);
  }, [invalidate]);

  return <primitive object={gltf.scene} />;
};

export default RoomModel;
