import { useState } from "react";
import Scene from "@/lab/components/Scene";
import LabWorkspace from "@/lab/components/LabWorkspace";
import WaveModel from "./WaveModel";
import { WAVES, getWave } from "@/lab/data/waves";

const WavePage = () => {
  const [activeId, setActiveId] = useState(WAVES[0].id);
  const wave = getWave(activeId);

  return (
    <LabWorkspace
      title="To'lqin va tebranish"
      description="Tebranish turini tanlang. Sahnani aylantirib turli burchakdan ko'ring."
      backTo="/physics"
      backLabel="Fizika"
      items={WAVES}
      activeId={activeId}
      onSelect={setActiveId}
      scene={
        <Scene camera={[0, 0, 9]} controls={{ minDistance: 4 }}>
          <WaveModel wave={wave} />
        </Scene>
      }
      info={
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">{wave.name}</h2>
          <p className="text-sm text-muted-foreground">{wave.about}</p>
        </div>
      }
    />
  );
};

export default WavePage;
