import { useState } from "react";
import Scene from "@/lab/components/Scene";
import LabViewer from "@/lab/components/LabViewer";
import ShapeModel from "./ShapeModel";
import { SHAPES, getShape } from "@/lab/data/shapes";

const Formula = ({ label, value }) => (
  <div className="rounded-lg bg-secondary px-3 py-2">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="font-mono text-sm">{value}</div>
  </div>
);

const GeometryPage = () => {
  const [activeId, setActiveId] = useState(SHAPES[0].id);
  const shape = getShape(activeId);

  return (
    <LabViewer
      title="Geometrik shakllar"
      description="Hajmli figurani aylantiring, hajm va yuza formulalarini ko'ring."
      items={SHAPES}
      activeId={activeId}
      onSelect={setActiveId}
      scene={
        <Scene camera={[3, 2, 5]}>
          <ShapeModel shape={shape} />
        </Scene>
      }
      info={
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">{shape.name}</h2>
          <p className="text-sm text-muted-foreground">{shape.about}</p>
          <div className="space-y-2">
            <Formula label="Hajm" value={shape.volume} />
            <Formula label="Sirt yuzasi" value={shape.surface} />
          </div>
        </div>
      }
    />
  );
};

export default GeometryPage;
