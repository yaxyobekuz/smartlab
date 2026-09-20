// Reads /:subject/:topic and renders the matching 3D topic page.
// Topic pages are lazy-loaded so the heavy 3D code is split out of the main bundle.
import { lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";

const PAGES = {
  // Walkable lab room; lab-3d stays as an alias for old links and review scripts.
  "chemistry/lab": lazy(() =>
    import("@/lab/features/chemistry/lab-room/LabRoomPage"),
  ),
  "chemistry/lab-3d": lazy(() =>
    import("@/lab/features/chemistry/lab-room/LabRoomPage"),
  ),
  "chemistry/periodic-table": lazy(() =>
    import("@/lab/features/chemistry/periodic/PeriodicTablePage"),
  ),
  "electronics/arduino": lazy(() =>
    import("@/lab/features/electronics/circuit/CircuitPage"),
  ),
  "history/registan": lazy(() =>
    import("@/lab/features/history/registan/RegistanGuidePage"),
  ),
  "history/atlas": lazy(() =>
    import("@/lab/features/history/atlas/AtlasPage"),
  ),
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
