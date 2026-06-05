import { useState } from "react";
import Scene from "@/lab/components/Scene";
import LabViewer from "@/lab/components/LabViewer";
import MoleculeModel from "./MoleculeModel";
import { MOLECULES, getMolecule } from "@/lab/data/molecules";

const MoleculesPage = () => {
  const [activeId, setActiveId] = useState(MOLECULES[0].id);
  const molecule = getMolecule(activeId);

  return (
    <LabViewer
      title="Molekulalar"
      description="Molekulani sichqoncha bilan aylantiring, atom ustiga olib boring."
      backTo="/chemistry"
      backLabel="Kimyo"
      items={MOLECULES}
      activeId={activeId}
      onSelect={setActiveId}
      scene={
        <Scene camera={[0, 0, 6]}>
          <MoleculeModel molecule={molecule} />
        </Scene>
      }
      info={
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold">{molecule.name}</h2>
            <span className="font-mono text-primary">{molecule.formula}</span>
          </div>
          <p className="text-sm text-muted-foreground">{molecule.about}</p>
          <p className="text-xs text-muted-foreground">
            Atomlar soni: {molecule.atoms.length}
          </p>
        </div>
      }
    />
  );
};

export default MoleculesPage;
