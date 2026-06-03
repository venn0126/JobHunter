import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Panel } from "@/components/ui/Panel";
import { useVersionInfo } from "@/hooks/useVersionInfo";
import { clearUpdateRestorePath, readUpdateRestorePoint } from "@/lib/updateRestore";
import { useJobStore, type JobFilters } from "@/stores/jobStore";
import { usePersonaStore } from "@/stores/personaStore";

const steps = ["保存当前页面", "检查版本文件", "等待服务恢复", "恢复原页面"];

export function UpdatePage() {
  const navigate = useNavigate();
  const versionState = useVersionInfo();
  const [currentStep, setCurrentStep] = useState(0);
  const restorePoint = useMemo(readUpdateRestorePoint, []);
  const restorePath = restorePoint.path;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentStep((value) => Math.min(value + 1, steps.length - 1));
    }, 700);
    return () => window.clearInterval(timer);
  }, []);

  const finishUpdate = () => {
    if (restorePoint.personaId) {
      usePersonaStore.getState().restorePersona(restorePoint.personaId);
    }
    if (restorePoint.filters) {
      const { setFilter } = useJobStore.getState();
      (Object.entries(restorePoint.filters) as Array<[keyof JobFilters, JobFilters[keyof JobFilters]]>).forEach(
        ([key, value]) => {
          setFilter(key, value);
        },
      );
    }
    if (restorePoint.sortKey) {
      useJobStore.getState().setSortKey(restorePoint.sortKey);
    }
    clearUpdateRestorePath();
    navigate(restorePath, { replace: true });
  };

  return (
    <div className="space-y-6">
      <Card as="section" surface="hero" className="p-6">
        <Badge tone="cyan" className="mb-4">
          更新等待页
        </Badge>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          正在准备恢复到最新版本。
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">
          当前页面已记录，更新完成后会回到：{restorePath}
        </p>
      </Card>

      <Panel title="更新进度">
        <div className="space-y-3">
          {steps.map((step, index) => (
            <Card key={step} surface="subtle" className="flex items-center justify-between p-4">
              <div className="font-medium">{step}</div>
              <Badge tone={index <= currentStep ? "cyan" : "muted"}>
                {index < currentStep ? "已完成" : index === currentStep ? "进行中" : "等待"}
              </Badge>
            </Card>
          ))}
        </div>
      </Panel>

      <Panel title="版本状态">
        <div className="grid gap-3 md:grid-cols-2">
          <Card surface="subtle" className="p-4">
            <div className="text-sm text-slate-500">当前版本</div>
            <div className="mt-2 text-xl font-semibold">v{versionState.current.version}</div>
            <div className="mt-1 text-sm text-slate-400">{versionState.current.build_id}</div>
          </Card>
          <Card surface="subtle" className="p-4">
            <div className="text-sm text-slate-500">检测版本</div>
            <div className="mt-2 text-xl font-semibold">v{versionState.latest.version}</div>
            <div className="mt-1 text-sm text-slate-400">{versionState.latest.build_id}</div>
          </Card>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={finishUpdate}>恢复原页面</Button>
          <Button asChild variant="secondary">
            <Link to="/">返回首页</Link>
          </Button>
        </div>
      </Panel>
    </div>
  );
}
