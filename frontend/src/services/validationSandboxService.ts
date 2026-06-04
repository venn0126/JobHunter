import { simulateVersionUpdateForValidation } from "@/hooks/useVersionInfo";
import { apiGet } from "@/services/apiClient";
import { useAuthStore } from "@/stores/authStore";

export type ValidationStatus = "failed" | "passed" | "simulated";

export interface ValidationResult {
  details?: string;
  message: string;
  status: ValidationStatus;
  title: string;
}

export function simulateTokenExpired(): ValidationResult {
  useAuthStore.getState().expireSessionForValidation();

  return {
    message: "已清空当前 session，受保护路由会跳回登录页。",
    status: "simulated",
    title: "Token 过期",
  };
}

export async function simulateApiFailure(): Promise<ValidationResult> {
  try {
    await apiGet("/debug/failure");
  } catch (error) {
    const details = error instanceof Error ? error.message : "unknown error";
    if (!details.includes("503")) {
      return {
        details,
        message: "调试失败接口未开启，请确认后端环境变量 DEBUG_ROUTES_ENABLED=true。",
        status: "simulated",
        title: "API 失败",
      };
    }

    return {
      details,
      message: "已捕获 503 API 失败，页面保持可用。",
      status: "passed",
      title: "API 失败",
    };
  }

  return {
    message: "调试接口未按预期失败，请检查 /api/debug/failure。",
    status: "simulated",
    title: "API 失败",
  };
}

export function simulateVersionUpdate(): ValidationResult {
  const latest = simulateVersionUpdateForValidation();

  return {
    details: latest.build_id,
    message: "已模拟发现新版本，设置页账户与版本区域应显示“发现新版本”。",
    status: "simulated",
    title: "发现新版本",
  };
}

export function simulateUpdateFailure(): ValidationResult {
  return {
    details: "当前版本和页面状态均会保留，可重新检查版本或继续使用当前页面。",
    message: "已模拟更新失败兜底：不清空本地状态，不跳转未知页面，并保留重试入口。",
    status: "failed",
    title: "更新失败",
  };
}
