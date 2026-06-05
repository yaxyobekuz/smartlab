// Single "Odam anatomiyasi" page holding every body system. The side panel
// switches which GLB model (myology, angiology, ...) is shown via local state.
import { useState } from "react";
import Scene from "@/lab/components/Scene";
import LabWorkspace from "@/lab/components/LabWorkspace";
import AnatomyModel from "./AnatomyModel";
import { ANATOMY, getAnatomy } from "@/lab/data/anatomy";

const AnatomyPage = () => {
  const [activeSlug, setActiveSlug] = useState(ANATOMY[0].slug);
  const model = getAnatomy(activeSlug);

  return (
    <LabWorkspace
      title={model.title}
      description="Modelni aylantiring. Bir qismga sichqonchani olib borsangiz nomi chiqadi."
      backTo="/biology"
      backLabel="Biologiya"
      items={ANATOMY.map((a) => ({ id: a.slug, name: a.title }))}
      activeId={model.slug}
      onSelect={setActiveSlug}
      scene={
        <Scene camera={[0, 1, 6]}>
          {/* Soft fill from several sides so the tinted anatomy reads clearly. */}
          <hemisphereLight args={["#ffffff", "#9ca3af", 0.9]} />
          <directionalLight position={[4, 6, 5]} intensity={0.8} />
          <directionalLight position={[-5, 2, -4]} intensity={0.4} />
          <AnatomyModel url={model.url} />
        </Scene>
      }
      info={
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">{model.title}</h2>
          <p className="text-sm text-muted-foreground">{model.about}</p>
        </div>
      }
    />
  );
};

export default AnatomyPage;
