import { useState } from "react";
import Scene from "@/lab/components/Scene";
import LabWorkspace from "@/lab/components/LabWorkspace";
import ArduinoModel from "./ArduinoModel";
import { ARDUINO, getArduino } from "@/lab/data/arduino";

const ArduinoPage = () => {
  const [activeId, setActiveId] = useState(ARDUINO[0].id);
  const demo = getArduino(activeId);

  return (
    <LabWorkspace
      title="Arduino"
      description="Loyihani tanlang. Plata va breadboardni aylantirib, LED va motorni jonli kuzating."
      backTo="/electronics"
      backLabel="Elektron mehanika"
      items={ARDUINO}
      activeId={activeId}
      onSelect={setActiveId}
      aiContext={{ code: demo.code }}
      scene={
        <Scene camera={[0, 4, 7]} controls={{ minDistance: 4 }}>
          <ArduinoModel demo={demo} />
        </Scene>
      }
      info={
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">{demo.name}</h2>
          <p className="text-sm text-muted-foreground">{demo.about}</p>
          <div>
            <div className="mb-1 text-xs font-medium text-muted-foreground">
              Sketch (kod)
            </div>
            <pre className="overflow-x-auto rounded-lg bg-secondary p-3 text-xs leading-relaxed text-foreground">
              <code>{demo.code}</code>
            </pre>
          </div>
        </div>
      }
    />
  );
};

export default ArduinoPage;
