// Lazy-loaded wrapper bundling the hero Canvas + object (keeps Three.js code-split).
import Scene from "@/lab/components/Scene";
import HeroObject from "@/lab/components/HeroObject";

const HeroScene = () => (
  <Scene camera={[0, 0, 6]} controls={{ enableZoom: false }}>
    <HeroObject />
  </Scene>
);

export default HeroScene;
