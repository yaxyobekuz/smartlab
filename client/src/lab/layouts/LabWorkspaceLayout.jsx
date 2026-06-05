import { Outlet } from "react-router-dom";

// Layout WITHOUT header - the 3D workspace fills the whole viewport.
const LabWorkspaceLayout = () => (
  <div className="h-dvh overflow-hidden bg-background">
    <Outlet />
  </div>
);

export default LabWorkspaceLayout;
