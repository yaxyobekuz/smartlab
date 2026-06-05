// Router
import { Routes as RoutesWrapper, Route } from "react-router-dom";

// Lab (public 3D laboratory)
import {
  LabLayout,
  LandingPage,
  SubjectPage,
  TopicPage,
  NotFoundPage,
} from "@/lab";

const Routes = () => (
  <RoutesWrapper>
    <Route element={<LabLayout />}>
      <Route index element={<LandingPage />} />
      <Route path="/:subject" element={<SubjectPage />} />
      <Route path="/:subject/:topic" element={<TopicPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </RoutesWrapper>
);

export default Routes;
