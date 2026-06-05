// One page reused by every anatomy topic. The topic slug from the URL selects
// which GLB model to load (myology, angiology, ...).
import { useParams, useNavigate } from "react-router-dom";
import Scene from "@/lab/components/Scene";
import LabWorkspace from "@/lab/components/LabWorkspace";
import NotFoundPage from "@/lab/pages/NotFoundPage";
import AnatomyModel from "./AnatomyModel";
import { ANATOMY, getAnatomy } from "@/lab/data/anatomy";

const AnatomyPage = () => {
  const { topic } = useParams();
  const navigate = useNavigate();
  const model = getAnatomy(topic);
  if (!model) return <NotFoundPage />;

  return (
    <LabWorkspace
      title={model.title}
      description="Modelni aylantirib turli tomondan ko'ring."
      backTo="/biology"
      backLabel="Biologiya"
      items={ANATOMY.map((a) => ({ id: a.slug, name: a.title }))}
      activeId={model.slug}
      // Switching item navigates to that model's topic page.
      onSelect={(id) => {
        if (id !== model.slug) navigate(`/biology/${id}`);
      }}
      scene={
        <Scene camera={[0, 1, 6]}>
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
