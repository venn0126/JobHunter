import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { appConfig } from "@/config/env";
import { useVersionInfo } from "@/hooks/useVersionInfo";
import { rememberUpdateRestorePath } from "@/lib/updateRestore";
import { useLocation, useNavigate } from "react-router-dom";

export function UpdateNotice() {
  const location = useLocation();
  const navigate = useNavigate();
  const versionState = useVersionInfo();
  const showStrongNotice = appConfig.isDemoMode || versionState.hasUpdate;

  const startUpdate = () => {
    rememberUpdateRestorePath(`${location.pathname}${location.search}`);
    navigate("/update");
  };

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
