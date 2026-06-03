import { Outlet } from "react-router-dom";
import { AppBackground } from "@/components/layout/AppBackground";
import { MobileNav } from "@/components/layout/MobileNav";
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
          <div className="w-full px-4 pb-24 pt-6 sm:px-8 lg:pb-6">
            <div className="mx-auto w-full max-w-screen-2xl 2xl:max-w-[1800px]">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
