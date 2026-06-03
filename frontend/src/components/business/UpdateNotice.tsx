import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useVersionInfo } from "@/hooks/useVersionInfo";

export function UpdateNotice() {
  const version = useVersionInfo();

  return (
    <Card surface="subtle" className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-sm font-medium text-cyanGlow">发现新版本入口</div>
        <div className="mt-1 text-sm text-slate-400">
          当前版本 v{version.version} · 点击后续将进入更新等待页并恢复当前页面
        </div>
      </div>
      <Button variant="secondary" size="sm">
        立即更新
      </Button>
    </Card>
  );
}
