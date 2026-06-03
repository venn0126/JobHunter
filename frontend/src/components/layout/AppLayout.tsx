import { Outlet } from "react-router-dom";
import { AppBackground } from "@/components/layout/AppBackground";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-ink-950 text-slate-100">
      <AppBackground />
      <div className="relative flex min-h-screen">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <div className="flex-1 px-4 py-6 sm:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
