import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Panel } from "@/components/ui/Panel";
import { Select } from "@/components/ui/Select";
import { appConfig } from "@/config/env";
import {
  demoDataModeOptions,
  getDataModeOption,
} from "@/services/demoConsoleService";
import type { VersionState } from "@/hooks/useVersionInfo";
import type { DataMode } from "@/types/common";
import type { AuthUser } from "@/types/auth";

export function DataModeSettingsPanel({
  dataMode,
  onChange,
}: {
  dataMode: DataMode;
  onChange: (dataMode: DataMode) => void;
}) {
  const activeDataModeOption = getDataModeOption(dataMode);

  return (
    <Panel title="数据模式">
      <Card surface="subtle" className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="blue">{dataMode}</Badge>
              <div className="font-medium">{activeDataModeOption.label}</div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">{activeDataModeOption.description}</p>
            <div className="mt-3 text-xs text-slate-500">
              环境默认：{appConfig.dataMode} · API：{appConfig.apiBaseUrl}
            </div>
          </div>
          <Select
            value={dataMode}
            onChange={(event) => onChange(event.target.value as DataMode)}
            className="md:w-52"
          >
            {demoDataModeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {demoDataModeOptions.map((option) => (
          <Card key={option.value} surface="subtle" className="p-4">
            <Badge tone={option.value === dataMode ? "cyan" : "muted"}>{option.value}</Badge>
            <div className="mt-3 font-medium">{option.label}</div>
            <p className="mt-2 text-xs leading-5 text-slate-400">{option.description}</p>
          </Card>
        ))}
      </div>
    </Panel>
  );
}

export function AccountVersionPanel({
  dataMode,
  onLogout,
  onStartUpdate,
  user,
  version,
}: {
  dataMode: DataMode;
  onLogout: () => void;
  onStartUpdate: () => void;
  user?: AuthUser;
  version: VersionState;
}) {
  return (
    <Panel title="账户与版本">
      <div className="grid gap-3 md:grid-cols-2">
        <ConsoleMetric label="当前账号" value={user?.name ?? "未登录"} />
        <ConsoleMetric label="数据模式" value={dataMode} />
        <ConsoleMetric label="当前版本" value={`v${version.current.version}`} />
        <ConsoleMetric label="版本状态" value={version.hasUpdate ? "发现新版本" : "已是当前版本"} />
      </div>
      <Card surface="subtle" className="mt-4 p-4">
        <div className="text-xs text-slate-500">Build</div>
        <div className="mt-2 break-all text-sm leading-6 text-slate-300">
          当前：{version.current.build_id}
          {version.hasUpdate ? ` / 最新：${version.latest.build_id}` : ""}
        </div>
      </Card>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          variant={version.hasUpdate || appConfig.isDemoMode ? "primary" : "secondary"}
          onClick={onStartUpdate}
        >
          {version.hasUpdate ? "发现新版本" : "检查更新"}
        </Button>
        <Button variant="ghost" onClick={onLogout}>
          退出登录
        </Button>
      </div>
    </Panel>
  );
}

export function DemoDataStatusPanel({
  feedbackCount,
  isAuthenticated,
  jobCount,
  onNavigateDemoReset,
  onResetDemo,
  pipelineCount,
  resumeDraftCount,
  vaultCount,
}: {
  feedbackCount: number;
  isAuthenticated: boolean;
  jobCount: number;
  onNavigateDemoReset: () => void;
  onResetDemo: () => void;
  pipelineCount: number;
  resumeDraftCount: number;
  vaultCount: number;
}) {
  return (
    <Panel title="Demo 数据状态">
      <div className="grid gap-3 md:grid-cols-2">
        <ConsoleMetric label="登录态" value={isAuthenticated ? "已登录" : "未登录"} />
        <ConsoleMetric label="岗位数据" value={`${jobCount}`} />
        <ConsoleMetric label="职业素材" value={`${vaultCount}`} />
        <ConsoleMetric label="管线卡片" value={`${pipelineCount}`} />
        <ConsoleMetric label="反馈记录" value={`${feedbackCount}`} />
        <ConsoleMetric label="简历草稿" value={`${resumeDraftCount}`} />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={onResetDemo}>重置标准 Demo</Button>
        <Button variant="secondary" onClick={onNavigateDemoReset}>
          通过 URL 重置
        </Button>
      </div>
    </Panel>
  );
}

export function DemoPreferencePanel({
  demoModeEnabled,
  demoResetPath,
  onCopyDemoEntry,
  onNavigateDemoEntry,
  onToggleDemoMode,
}: {
  demoModeEnabled: boolean;
  demoResetPath: string;
  onCopyDemoEntry: () => void;
  onNavigateDemoEntry: () => void;
  onToggleDemoMode: () => void;
}) {
  return (
    <Panel title="演示偏好">
      <Card surface="subtle" className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={demoModeEnabled ? "cyan" : "muted"}>
                {demoModeEnabled ? "已开启" : "已关闭"}
              </Badge>
              <div className="font-medium">大屏 Demo 模式</div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              开启后使用更大的字号和更强演示视觉；关闭后恢复常规工作区显示。
            </p>
          </div>
          <Button variant={demoModeEnabled ? "secondary" : "primary"} onClick={onToggleDemoMode}>
            {demoModeEnabled ? "关闭大屏模式" : "开启大屏模式"}
          </Button>
        </div>
      </Card>
      <Card surface="subtle" className="mt-4 p-4">
        <div className="text-xs text-slate-500">固定演示入口</div>
        <div className="mt-2 break-all text-sm leading-6 text-slate-300">{demoResetPath}</div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button size="sm" variant="secondary" onClick={onCopyDemoEntry}>
            复制入口
          </Button>
          <Button size="sm" variant="secondary" onClick={onNavigateDemoEntry}>
            立即进入
          </Button>
        </div>
      </Card>
    </Panel>
  );
}

export function SystemConnectivityPanel({
  healthLoading,
  onCheckHealth,
}: {
  healthLoading: boolean;
  onCheckHealth: () => void;
}) {
  return (
    <Panel title="系统连通性">
      <Card surface="subtle" className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="font-medium">API 健康检查</div>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              用于确认当前 API Base URL 是否可访问，切换到 api / hybrid 模式前建议先检查。
            </p>
            <div className="mt-3 break-all text-xs text-slate-500">{appConfig.apiBaseUrl}/health</div>
          </div>
          <Button disabled={healthLoading} onClick={onCheckHealth}>
            {healthLoading ? "检查中" : "检查 API 健康"}
          </Button>
        </div>
      </Card>
    </Panel>
  );
}

export function ConsoleMetric({ label, value }: { label: string; value: string }) {
  return (
    <Card surface="subtle" className="p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-cyanGlow">{value}</div>
    </Card>
  );
}
