// Router
import { Outlet } from "react-router-dom";

// Components
import {
  SidebarInset,
  SidebarProvider,
} from "@/shared/components/shadcn/sidebar";
import AppHeader from "@/shared/components/layout/AppHeader";
import AppSidebar from "@/shared/components/layout/AppSidebar";

const DashboardLayout = () => (
  <SidebarProvider className="relative z-10">
    <AppSidebar />
    <SidebarInset>
      <AppHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 md:py-2">
        <Outlet />
      </div>
    </SidebarInset>
  </SidebarProvider>
);

export default DashboardLayout;
