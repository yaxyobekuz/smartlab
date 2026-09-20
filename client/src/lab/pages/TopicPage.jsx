// Reads /:subject/:topic and renders the matching 3D topic page.
// Topic pages are lazy-loaded so the heavy 3D code is split out of the main bundle.
import { lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";

const PAGES = {
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
