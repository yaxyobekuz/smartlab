import { useState } from "react";
import Scene from "@/lab/components/Scene";
import LabViewer from "@/lab/components/LabViewer";
import SolarSystemModel from "./SolarSystemModel";
import { PLANETS, getPlanet } from "@/lab/data/planets";

const SolarSystemPage = () => {
  const [activeId, setActiveId] = useState(PLANETS[2].id);
  const planet = getPlanet(activeId);

  return (
    <LabViewer
      title="Quyosh tizimi"
      description="Sayyora ustiga bosing yoki ro'yxatdan tanlang. Sahnani aylantiring."
      items={PLANETS}
      activeId={activeId}
      onSelect={setActiveId}
      scene={
        <Scene camera={[0, 14, 24]} controls={{ maxDistance: 60 }}>
          <SolarSystemModel activeId={activeId} onSelect={setActiveId} />
        </Scene>
      }
      info={
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">{planet.name}</h2>
          <p className="text-sm text-muted-foreground">{planet.about}</p>
          <p className="text-xs text-muted-foreground">
            Quyoshdan tartibi: {PLANETS.findIndex((p) => p.id === planet.id) + 1}
          </p>
        </div>
      }
    />
  );
};

export default SolarSystemPage;
