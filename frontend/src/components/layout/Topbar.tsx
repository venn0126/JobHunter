import { appConfig } from "@/config/env";
import { useVersionInfo } from "@/hooks/useVersionInfo";
import { getActivePersona, usePersonaStore } from "@/stores/personaStore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function Topbar() {
  const version = useVersionInfo();
  const personas = usePersonaStore((state) => state.personas);
  const activePersonaId = usePersonaStore((state) => state.activePersonaId);
  const setActivePersona = usePersonaStore((state) => state.setActivePersona);
  const activePersona = getActivePersona({ personas, activePersonaId });

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-ink-950/70 px-4 py-4 backdrop-blur-xl sm:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold">
            DU
          </div>
          <div>
            <div className="text-sm text-slate-400">Demo User</div>
            <div className="text-xl font-semibold">从海投到精投，你的 AI 求职作战中枢</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm">
            <span className="text-slate-400">当前身份</span>
            <select
              value={activePersonaId}
              onChange={(event) => setActivePersona(event.target.value)}
              className="bg-transparent text-cyanGlow outline-none"
            >
              {personas.map((persona) => (
                <option key={persona.id} value={persona.id} className="bg-ink-900 text-white">
                  {persona.name}
                </option>
              ))}
            </select>
          </label>
          <Badge tone="blue" className="py-2">
            {appConfig.dataMode}
          </Badge>
          <Badge className="py-2">v{version.version}</Badge>
          <Button variant="secondary" size="sm">
            发现新版本
          </Button>
        </div>
      </div>
      <div className="mt-3 text-sm text-slate-500">
        {activePersona ? `目标方向：${activePersona.target_roles.join(" / ")}` : "尚未选择求职身份"}
      </div>
    </header>
  );
}
