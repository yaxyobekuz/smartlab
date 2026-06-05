// Reads /:subject/:topic and renders the matching 3D topic page.
// Topic pages are lazy-loaded so the heavy 3D code is split out of the main bundle.
import { lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";

const PAGES = {
  // One page for all human-anatomy systems; the active one is picked in-page.
  "biology/anatomy": lazy(() =>
    import("@/lab/features/biology/anatomy/AnatomyPage"),
  ),
  "chemistry/molecules": lazy(() =>
    import("@/lab/features/chemistry/molecules/MoleculesPage"),
  ),
  "chemistry/lab": lazy(() =>
    import("@/lab/features/chemistry/lab/LabBenchPage"),
  ),
  "chemistry/atoms": lazy(() =>
    import("@/lab/features/chemistry/atoms/AtomsPage"),
  ),
  "biology/cell": lazy(() => import("@/lab/features/biology/cell/CellPage")),
  "biology/dna": lazy(() => import("@/lab/features/biology/dna/DnaPage")),
  "physics/solar-system": lazy(() =>
    import("@/lab/features/physics/solar-system/SolarSystemPage"),
  ),
  "physics/wave": lazy(() => import("@/lab/features/physics/wave/WavePage")),
};

const Fallback = () => (
  <div className="container grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
    Yuklanmoqda...
  </div>
);

const TopicPage = () => {
  const { subject, topic } = useParams();
  const Page = PAGES[`${subject}/${topic}`];
  if (!Page) return <NotFoundPage />;
  return (
    <Suspense fallback={<Fallback />}>
      <Page />
    </Suspense>
  );
};

export default TopicPage;
