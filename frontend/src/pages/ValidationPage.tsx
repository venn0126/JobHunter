import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProfileSettingsForm } from "@/components/business/ProfileSettingsForm";
import {
  AccountVersionPanel,
  DataModeSettingsPanel,
  DemoDataStatusPanel,
  DemoPreferencePanel,
  SystemConnectivityPanel,
} from "@/components/business/SettingsPanels";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Panel } from "@/components/ui/Panel";
import { useStartUpdate } from "@/hooks/useStartUpdate";
import { useToast } from "@/hooks/useToast";
import { useVersionInfo } from "@/hooks/useVersionInfo";
import { copyText } from "@/lib/clipboard";
import { disableDemoMode, enableDemoMode, getDemoResetPath, isDemoModeEnabled } from "@/lib/demoMode";
import {
  checkSystemHealth,
  demoScenarioCards,
  getDataModeOption,
  getValidationStatusTone,
} from "@/services/demoConsoleService";
import { resetDemoWorkspace } from "@/services/demoResetService";
import {
  simulateApiFailure,
  simulateTokenExpired,
  simulateUpdateFailure,
  simulateVersionUpdate,
  type ValidationResult,
} from "@/services/validationSandboxService";
import { useAppStore } from "@/stores/appStore";
import { useAuthStore } from "@/stores/authStore";
import { useCareerVaultStore } from "@/stores/careerVaultStore";
import { useFeedbackReviewStore } from "@/stores/feedbackReviewStore";
import { useJobStore } from "@/stores/jobStore";
import { usePipelineStore } from "@/stores/pipelineStore";
import { getActivePersona, usePersonaStore } from "@/stores/personaStore";
import { useResumeStudioStore } from "@/stores/resumeStudioStore";
import type { DataMode } from "@/types/common";

type ScenarioId = (typeof demoScenarioCards)[number]["id"];

export function ValidationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dataMode = useAppStore((state) => state.dataMode);
  const setDataMode = useAppStore((state) => state.setDataMode);
  const session = useAuthStore((state) => state.session);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const personas = usePersonaStore((state) => state.personas);
  const activePersonaId = usePersonaStore((state) => state.activePersonaId);
  const updatePersona = usePersonaStore((state) => state.updatePersona);
  const jobCount = useJobStore((state) => state.jobs.length);
  const vaultCount = useCareerVaultStore((state) => state.items.length);
  const pipelineCount = usePipelineStore((state) => state.entries.length);
  const feedbackCount = useFeedbackReviewStore((state) => state.records.length);
  const resumeDraftCount = useResumeStudioStore((state) => Object.keys(state.draftsByJobId).length);
  const { showToast } = useToast();
  const startUpdate = useStartUpdate();
  const version = useVersionInfo();
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);
  const [demoModeEnabled, setDemoModeEnabled] = useState(isDemoModeEnabled());
  const activePersona = getActivePersona({ activePersonaId, personas });
  const demoResetPath = getDemoResetPath();

  const handleDataModeChange = (nextDataMode: DataMode) => {
    setDataMode(nextDataMode);
    showToast({
      message: getDataModeOption(nextDataMode).description,
      title: `数据模式已切换为 ${nextDataMode}`,
    });
  };

  const handleResetDemo = () => {
    const resetResult = resetDemoWorkspace();
    setResult({
      message: resetResult.message,
      status: "passed",
      title: "Demo 重置",
    });
    showToast({ message: resetResult.message, title: "Demo 已重置" });
  };

  const handleToggleDemoMode = () => {
    const nextEnabled = !demoModeEnabled;
    if (nextEnabled) {
      enableDemoMode();
    } else {
      disableDemoMode();
    }
    setDemoModeEnabled(nextEnabled);
    showToast({ title: nextEnabled ? "大屏 Demo 模式已开启" : "大屏 Demo 模式已关闭" });
  };

  const handleCopyDemoEntry = () => {
    void copyText(`${window.location.origin}${demoResetPath}`);
    showToast({ message: demoResetPath, title: "已复制固定演示入口" });
  };

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

  const handleSystemHealthCheck = async () => {
    setHealthLoading(true);
    try {
      const health = await checkSystemHealth();
      setResult({
        details: `${health.app} v${health.version} / ${health.data_mode}`,
        message: `后端健康状态：${health.status}`,
        status: health.status === "ok" ? "passed" : "simulated",
        title: "系统健康检查",
      });
    } catch (error) {
      setResult({
        details: error instanceof Error ? error.message : "unknown error",
        message: "后端健康检查失败，请确认 API 服务是否启动。",
        status: "failed",
        title: "系统健康检查",
      });
    } finally {
      setHealthLoading(false);
    }
  };

  const handleVersionUpdate = () => {
    setResult(simulateVersionUpdate());
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleSaveProfileSettings = (input: {
    coreSkills: string[];
    email: string;
    personaName: string;
    preferredCities: string[];
    targetRoles: string[];
    userName: string;
  }) => {
    updateProfile({ email: input.email, name: input.userName });
    if (activePersona) {
      updatePersona(activePersona.id, {
        core_skills: input.coreSkills,
        name: input.personaName,
        preferred_cities: input.preferredCities,
        target_roles: input.targetRoles,
      });
    }
    showToast({ message: input.personaName, title: "个人设置已保存" });
  };

  const scenarioActionMap: Record<ScenarioId, () => void> = {
    "api-failure": () => {
      void handleApiFailure();
    },
    "token-expired": handleTokenExpired,
    "update-failure": () => setResult(simulateUpdateFailure()),
    "version-update": handleVersionUpdate,
  };

  return (
    <div className="space-y-6">
      <Card as="section" surface="hero" className="p-6">
        <Badge tone="cyan" className="mb-4">
          P1-J Demo 控制台
        </Badge>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          现场演示状态集中控制台。
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">
          集中切换数据模式、重置 Demo、模拟 API 失败和版本更新，避免把调试开关散落在业务页面。
        </p>
      </Card>

      <Panel title="个人设置">
        <ProfileSettingsForm
          persona={activePersona}
          user={session?.user}
          onSave={handleSaveProfileSettings}
        />
      </Panel>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <DataModeSettingsPanel dataMode={dataMode} onChange={handleDataModeChange} />
        <AccountVersionPanel
          dataMode={dataMode}
          user={session?.user}
          version={version}
          onLogout={handleLogout}
          onStartUpdate={startUpdate}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <DemoDataStatusPanel
          feedbackCount={feedbackCount}
          isAuthenticated={isAuthenticated}
          jobCount={jobCount}
          pipelineCount={pipelineCount}
          resumeDraftCount={resumeDraftCount}
          vaultCount={vaultCount}
          onNavigateDemoReset={() => navigate(demoResetPath)}
          onResetDemo={handleResetDemo}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <DemoPreferencePanel
          demoModeEnabled={demoModeEnabled}
          demoResetPath={demoResetPath}
          onCopyDemoEntry={handleCopyDemoEntry}
          onNavigateDemoEntry={() => navigate(demoResetPath)}
          onToggleDemoMode={handleToggleDemoMode}
        />
        <SystemConnectivityPanel healthLoading={healthLoading} onCheckHealth={handleSystemHealthCheck} />
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        {demoScenarioCards.map((card) => (
          <ValidationCard
            actionLabel={card.id === "api-failure" && apiLoading ? "验证中" : card.actionLabel}
            description={card.description}
            disabled={card.id === "api-failure" && apiLoading}
            key={card.id}
            onAction={scenarioActionMap[card.id]}
            title={card.title}
          />
        ))}
      </section>

      <Panel title="验证结果">
        {result ? (
          <Card surface="subtle" className="p-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={getValidationStatusTone(result.status)}>{result.status}</Badge>
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
          <Button variant="secondary" onClick={() => navigate("/")}>
            返回首页驾驶舱
          </Button>
          <Button variant="secondary" onClick={() => navigate("/debug")}>
            打开 Debug 别名
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
