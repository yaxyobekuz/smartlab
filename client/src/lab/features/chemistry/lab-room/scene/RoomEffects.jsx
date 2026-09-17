import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

// High tier only: MSAA, soft glow on light sources, Neutral tone mapping (Low uses the renderer's).
const RoomEffects = () => (
  <EffectComposer multisampling={4}>
    <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.25} intensity={0.35} />
    <ToneMapping mode={ToneMappingMode.NEUTRAL} />
  </EffectComposer>
);

export default RoomEffects;
