import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";
import { appConfig } from "@/config/env";
import { useStartUpdate } from "@/hooks/useStartUpdate";
import { useVersionInfo } from "@/hooks/useVersionInfo";

export function UpdateNotice() {
  const startUpdate = useStartUpdate();
  const versionState = useVersionInfo();
  const showStrongNotice = appConfig.isDemoMode || versionState.hasUpdate;

  if (versionState.loading) {
    return <LoadingState label="正在检查版本信息" />;
  }

  return (
    <Card
      surface="subtle"
      className={
        showStrongNotice
          ? "flex flex-col gap-3 border-cyanGlow/30 bg-cyanGlow/10 p-4 sm:flex-row sm:items-center sm:justify-between"
          : "flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
      }
    >
      <div>
        <div className="text-sm font-medium text-cyanGlow">
          {versionState.hasUpdate ? "发现新版本" : "版本检查已开启"}
        </div>
        <div className="mt-1 text-sm text-slate-400">
          当前 v{versionState.current.version} / {versionState.current.build_id}
          {versionState.hasUpdate
            ? ` · 最新 v${versionState.latest.version} / ${versionState.latest.build_id}`
            : " · 本地开发默认弱提示，演示环境开启强提示"}
        </div>
      </div>
      <Button variant={showStrongNotice ? "primary" : "secondary"} size="sm" onClick={startUpdate}>
        立即更新
      </Button>
    </Card>
  );
}
