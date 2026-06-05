// Router
import { Routes as RoutesWrapper, Route } from "react-router-dom";

// Lab (public 3D laboratory)
import {
  LabLayout,
  LabWorkspaceLayout,
  LandingPage,
  SubjectPage,
  TopicPage,
  NotFoundPage,
} from "@/lab";

const Routes = () => (
  <RoutesWrapper>
    {/* Content pages — with header */}
    <Route element={<LabLayout />}>
      <Route index element={<LandingPage />} />
      <Route path="/:subject" element={<SubjectPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>

    {/* 3D workspace — no header, full screen */}
    <Route element={<LabWorkspaceLayout />}>
      <Route path="/:subject/:topic" element={<TopicPage />} />
    </Route>
  </RoutesWrapper>
);

export default Routes;
