import { Outlet } from "react-router-dom";
import LabHeader from "@/lab/components/LabHeader";

// Full-height shell. The header is fixed; the main area fills the remaining
// height. Scrollable pages (landing/subject) manage their own overflow;
// the 3D workspace fills the area exactly (h-full).
const LabLayout = () => (
  <div className="flex h-dvh flex-col overflow-hidden bg-background">
    <LabHeader />
    <main className="min-h-0 flex-1 overflow-y-auto">
      <Outlet />
    </main>
  </div>
);

export default LabLayout;
