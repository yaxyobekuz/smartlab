// Router
import { Routes as RoutesWrapper, Route } from "react-router-dom";

// Lab (public 3D laboratory)
import { LabLayout, LandingPage, CategoryPage, NotFoundPage } from "@/lab";

const Routes = () => (
  <RoutesWrapper>
    <Route element={<LabLayout />}>
      <Route index element={<LandingPage />} />
      <Route path="/:category" element={<CategoryPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </RoutesWrapper>
);

export default Routes;
