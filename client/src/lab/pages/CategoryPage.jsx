// Reads the :category URL param and renders the matching category page.
// Category pages are lazy-loaded so the heavy 3D code is split out of the main bundle.
import { lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";

const PAGES = {
  molecules: lazy(() => import("@/lab/features/molecules/MoleculesPage")),
  atoms: lazy(() => import("@/lab/features/atoms/AtomsPage")),
  "solar-system": lazy(() => import("@/lab/features/solar-system/SolarSystemPage")),
  geometry: lazy(() => import("@/lab/features/geometry/GeometryPage")),
};

const Fallback = () => (
  <div className="container grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
    Yuklanmoqda...
  </div>
);

const CategoryPage = () => {
  const { category } = useParams();
  const Page = PAGES[category];
  if (!Page) return <NotFoundPage />;
  return (
    <Suspense fallback={<Fallback />}>
      <Page />
    </Suspense>
  );
};

export default CategoryPage;
