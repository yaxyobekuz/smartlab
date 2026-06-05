import { useState } from "react";
import Scene from "@/lab/components/Scene";
import LabWorkspace from "@/lab/components/LabWorkspace";
import CellModel from "./CellModel";
import { ORGANELLES, getOrganelle } from "@/lab/data/cell";

const CellPage = () => {
  const [activeId, setActiveId] = useState(ORGANELLES[0].id);
  const organelle = getOrganelle(activeId);

  return (
    <LabWorkspace
      title="Hujayra"
      description="Organoid ustiga bosing yoki ro'yxatdan tanlang. Hujayrani aylantiring."
      backTo="/biology"
      backLabel="Biologiya"
      items={ORGANELLES}
      activeId={activeId}
      onSelect={setActiveId}
      scene={
        <Scene camera={[0, 2, 9]}>
          <CellModel activeId={activeId} onSelect={setActiveId} />
        </Scene>
      }
      info={
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">{organelle.name}</h2>
          <p className="text-sm text-muted-foreground">{organelle.about}</p>
        </div>
      }
    />
  );
};

export default CellPage;
