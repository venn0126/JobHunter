import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { OpportunityHeatCard } from "@/components/business/OpportunityHeatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Panel } from "@/components/ui/Panel";
import { useRuntimeData } from "@/stores/runtimeDataStore";

type MarketMode = "global" | "personalized";

export function OpportunityPage() {
  const market = useRuntimeData().market;
  const [mode, setMode] = useState<MarketMode>(market.mode);

  const hotRoles = useMemo(
    () => (mode === "global" ? market.global.hot_roles : market.personalized.recommended_directions),
    [market, mode],
  );

  return (
    <div className="space-y-6">
      <Card as="section" surface="hero" className="p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge tone="cyan" className="mb-4">
              机会热度广场
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              先发现方向，再进入岗位雷达。
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">
              冷启动展示全局机会热度；已有画像时展示更适合当前求职身份的方向，并可一键带筛选进入岗位雷达。
            </p>
          </div>
          <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
            <ModeButton active={mode === "personalized"} onClick={() => setMode("personalized")}>
              我的倾向
            </ModeButton>
            <ModeButton active={mode === "global"} onClick={() => setMode("global")}>
              全局热度
            </ModeButton>
          </div>
        </div>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <Panel title={mode === "global" ? "全局热门方向" : "更适合你的方向"}>
          {hotRoles.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {hotRoles.map((item) => (
                <OpportunityHeatCard key={item.name} item={item} />
              ))}
            </div>
          ) : (
            <Card surface="subtle" className="p-5">
              <div className="font-medium">暂无画像数据</div>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                你可以先加载 Demo 素材或补充职业素材，系统会生成更准确的机会倾向。
              </p>
              <Button asChild className="mt-4" variant="secondary">
                <Link to="/resume">补充职业素材</Link>
              </Button>
            </Card>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="热门城市">
            <div className="space-y-3">
              {market.global.hot_cities.map((city) => (
                <HeatRow key={city.name} label={city.name} value={city.heat} />
              ))}
            </div>
          </Panel>
          <Panel title="增长技能">
            <div className="space-y-3">
              {market.global.hot_skills.map((skill) => (
                <HeatRow key={skill.name} label={`${skill.name} +${skill.growth}%`} value={skill.heat} />
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <Panel title="下一步行动">
        <div className="grid gap-3 md:grid-cols-3">
          {market.personalized.next_actions.map((action) => (
            <Card key={action} surface="subtle" className="p-4 text-sm text-slate-300">
              {action}
            </Card>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function ModeButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      className={
        active
          ? "rounded-full bg-cyanGlow px-4 py-2 text-sm font-medium text-ink-950"
          : "rounded-full px-4 py-2 text-sm text-slate-400 transition hover:text-white"
      }
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function HeatRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-cyanGlow">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full bg-gradient-to-r from-cyanGlow to-blueGlow" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
