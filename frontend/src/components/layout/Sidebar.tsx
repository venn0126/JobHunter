import { NavLink } from "react-router-dom";
import { primaryNavItems } from "@/app/routes";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/classNames";

const navIconMap = ["⌂", "⌁", "◎", "▦", "◫", "✦", "↺", "⚙"];

export function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-ink-900/80 p-6 shadow-card backdrop-blur-xl lg:block">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-cyanGlow/30 bg-cyanGlow/10 text-lg text-cyanGlow shadow-glow">
            JH
          </div>
          <div>
            <div className="text-2xl font-semibold tracking-tight">JobHunter</div>
            <div className="mt-1 text-sm text-slate-400">AI 求职作战中枢</div>
          </div>
        </div>
      </div>
      <nav className="space-y-2">
        {primaryNavItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-2xl border px-4 py-3 transition",
                isActive
                  ? "border-cyanGlow/40 bg-cyanGlow/10 text-white shadow-glow"
                  : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-white",
              )
            }
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm text-cyanGlow/90">
              {navIconMap[index]}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">{item.label}</span>
              <span className="mt-1 block truncate text-xs text-slate-500">{item.description}</span>
            </span>
          </NavLink>
        ))}
      </nav>
      <Card surface="accent" className="mt-8 p-4 text-sm text-slate-300">
        <div className="font-medium text-cyanGlow">P0 工程基建</div>
        <p className="mt-2 leading-6">当前阶段先保证工程可运行、Mock 可切换、命令可验证。</p>
      </Card>
    </aside>
  );
}
