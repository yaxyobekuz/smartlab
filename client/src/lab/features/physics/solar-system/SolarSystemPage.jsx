import { useState } from "react";
import Scene from "@/lab/components/Scene";
import LabWorkspace from "@/lab/components/LabWorkspace";
import SolarSystemModel from "./SolarSystemModel";
import { PLANETS, getPlanet } from "@/lab/data/planets";

const Fact = ({ label, value }) =>
  value == null || value === "" ? null : (
    <div className="flex justify-between gap-3 border-b border-border/60 py-1 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );

const SolarSystemPage = () => {
  const [activeId, setActiveId] = useState(PLANETS[2].id);
  const planet = getPlanet(activeId);

  return (
    <LabWorkspace
      title="Quyosh tizimi"
      description="Sayyora ustiga bosing yoki ro'yxatdan tanlang. Sahnani aylantiring."
      backTo="/physics"
      backLabel="Fizika"
      items={PLANETS}
      activeId={activeId}
      onSelect={setActiveId}
      scene={
        <Scene camera={[0, 14, 24]} controls={{ maxDistance: 60 }}>
          <SolarSystemModel activeId={activeId} onSelect={setActiveId} />
        </Scene>
      }
      info={
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">{planet.name}</h2>
          <p className="text-sm text-muted-foreground">{planet.about}</p>
          <dl className="space-y-1.5 text-sm">
            <Fact label="Quyoshdan tartibi" value={PLANETS.findIndex((p) => p.id === planet.id) + 1} />
            <Fact label="Diametri" value={planet.diameter} />
            <Fact label="Quyoshdan uzoqligi" value={planet.distanceFromSun} />
            <Fact label="Bir yili" value={planet.orbitalPeriod} />
            <Fact label="Tortishish kuchi" value={planet.gravity} />
            <Fact label="Yo'ldoshlari" value={`${planet.moons} ta`} />
          </dl>
        </div>
      }
    />
  );
};

export default SolarSystemPage;
