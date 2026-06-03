import { apiGet } from "@/services/apiClient";
import { useAuthStore } from "@/stores/authStore";
import { simulateVersionUpdateForValidation } from "@/hooks/useVersionInfo";

export type ValidationStatus = "passed" | "simulated";

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
    message: "已模拟发现新版本，顶部栏应显示“发现新版本”。",
    status: "simulated",
    title: "发现新版本",
  };
}
