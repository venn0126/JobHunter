import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { syncRuntimeData } from "@/services/bootstrapDataService";
import { useAppStore } from "@/stores/appStore";
import { useRuntimeDataStore } from "@/stores/runtimeDataStore";

const loadingRecoveryDelayMs = 3000;

export function RuntimeRecoveryPanel() {
  const dataMode = useAppStore((state) => state.dataMode);
  const setDataMode = useAppStore((state) => state.setDataMode);
  const runtimeError = useRuntimeDataStore((state) => state.error);
  const runtimeLoading = useRuntimeDataStore((state) => state.loading);
  const runtimeMode = useRuntimeDataStore((state) => state.mode);
  const [showLoadingRecovery, setShowLoadingRecovery] = useState(false);

  useEffect(() => {
    if (!runtimeLoading) {
      setShowLoadingRecovery(false);
      return;
    }

    const timerId = window.setTimeout(() => setShowLoadingRecovery(true), loadingRecoveryDelayMs);
    return () => window.clearTimeout(timerId);
  }, [runtimeLoading]);

  const hasModeMismatch = dataMode === "api" && runtimeMode !== "api";
  const shouldShow = Boolean(runtimeError) || showLoadingRecovery || hasModeMismatch;
  if (!shouldShow) {
    return null;
  }

  const recoverToMock = () => {
    setDataMode("mock");
    void syncRuntimeData("mock");
  };

  return (
    <Card className="fixed bottom-5 right-5 z-[100] max-w-sm border-risk-medium/30 bg-ink-900/95 p-4 shadow-card backdrop-blur-xl">
      <div className="text-sm font-medium text-slate-100">数据源恢复</div>
      <div className="mt-2 text-xs leading-5 text-slate-400">
        当前配置：{dataMode} / 实际数据：{runtimeMode}
        {runtimeError ? ` / ${runtimeError}` : ""}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={recoverToMock}>
          恢复 Mock
        </Button>
        <Button asChild size="sm" variant="secondary">
          <a href="/debug/overlay">定位遮罩</a>
        </Button>
      </div>
    </Card>
  );
}
