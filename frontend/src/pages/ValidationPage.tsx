import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Panel } from "@/components/ui/Panel";
import { useStartUpdate } from "@/hooks/useStartUpdate";
import {
  simulateApiFailure,
  simulateTokenExpired,
  simulateVersionUpdate,
  type ValidationResult,
} from "@/services/validationSandboxService";

export function ValidationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const startUpdate = useStartUpdate();
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  const handleTokenExpired = () => {
    setResult(simulateTokenExpired());
    navigate("/login", { replace: true, state: { from: location } });
  };

  const handleApiFailure = async () => {
    setApiLoading(true);
    try {
      setResult(await simulateApiFailure());
    } finally {
      setApiLoading(false);
    }
  };

  const handleVersionUpdate = () => {
    setResult(simulateVersionUpdate());
  };

  const validationCards = [
    {
      actionLabel: "模拟 Token 过期",
      description: "清空当前 session，并回到登录页，验证受保护路由不会白屏。",
      onAction: handleTokenExpired,
      title: "Token 过期",
    },
    {
      actionLabel: apiLoading ? "验证中" : "模拟 API 失败",
      description: "请求 /api/debug/failure，验证 503 错误能被捕获并展示结果。",
      disabled: apiLoading,
      onAction: handleApiFailure,
      title: "API 失败",
    },
    {
      actionLabel: "模拟发现新版本",
      description: "在前端版本 watcher 中注入临时 build_id，验证更新提示链路。",
      onAction: handleVersionUpdate,
      title: "发现新版本",
    },
  ];

  return (
    <div className="space-y-6">
      <Card as="section" surface="hero" className="p-6">
        <Badge tone="cyan" className="mb-4">
          最小验证入口
        </Badge>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          现场前快速模拟高风险状态。
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">
          集中验证 Token 过期、API 失败和发现新版本三类高风险链路，避免把调试开关散落在业务页面。
        </p>
      </Card>

      <section className="grid gap-4 xl:grid-cols-3">
        {validationCards.map((card) => (
          <ValidationCard key={card.title} {...card} />
        ))}
      </section>

      <Panel title="验证结果">
        {result ? (
          <Card surface="subtle" className="p-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={result.status === "passed" ? "cyan" : "blue"}>{result.status}</Badge>
              <div className="font-medium">{result.title}</div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{result.message}</p>
            {result.details ? <div className="mt-2 text-xs text-slate-500">{result.details}</div> : null}
          </Card>
        ) : (
          <Card surface="subtle" className="p-5 text-sm text-slate-400">
            请选择上方任一验证项。
          </Card>
        )}
      </Panel>

      <Panel title="后续动作">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={startUpdate}>
            进入更新等待页
          </Button>
          <Button variant="secondary" onClick={() => navigate("/?mode=demo&reset=demo")}>
            恢复标准 Demo
          </Button>
        </div>
      </Panel>
    </div>
  );
}

function ValidationCard({
  actionLabel,
  description,
  disabled,
  onAction,
  title,
}: {
  actionLabel: string;
  description: string;
  disabled?: boolean;
  onAction: () => void;
  title: string;
}) {
  return (
    <Card surface="subtle" className="flex min-h-56 flex-col justify-between p-5">
      <div>
        <div className="text-lg font-semibold">{title}</div>
        <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
      </div>
      <Button className="mt-6 w-full" disabled={disabled} onClick={onAction}>
        {actionLabel}
      </Button>
    </Card>
  );
}
