import type { BadgeTone } from "@/components/ui/Badge";
import { apiGet } from "@/services/apiClient";
import type { ValidationStatus } from "@/services/validationSandboxService";
import type { DataMode } from "@/types/common";

export interface SystemHealthInfo {
  app: string;
  data_mode: string;
  status: string;
  version: string;
}

export const demoDataModeOptions: Array<{
  description: string;
  label: string;
  value: DataMode;
}> = [
  {
    description: "所有模块使用本地 Mock 数据，适合比赛现场稳定演示。",
    label: "Mock 演示",
    value: "mock",
  },
  {
    description: "优先请求真实 API，适合联调后端和算法服务。",
    label: "API 联调",
    value: "api",
  },
  {
    description: "核心数据走 Mock，部分调试接口走 API，适合渐进接入。",
    label: "Hybrid 混合",
    value: "hybrid",
  },
];

export const demoScenarioCards = [
  {
    actionLabel: "模拟 Token 过期",
    description: "清空当前 session，并回到登录页，验证受保护路由不会白屏。",
    id: "token-expired",
    title: "Token 过期",
  },
  {
    actionLabel: "模拟 API 失败",
    description: "请求 /api/debug/failure，验证 503 错误能被捕获并展示结果。",
    id: "api-failure",
    title: "API 失败",
  },
  {
    actionLabel: "模拟发现新版本",
    description: "注入临时 build_id，验证设置页和首页更新提示链路。",
    id: "version-update",
    title: "发现新版本",
  },
  {
    actionLabel: "模拟更新失败",
    description: "验证更新失败时保留当前版本和页面状态，并提供重试入口。",
    id: "update-failure",
    title: "更新失败",
  },
] as const;

export function getDataModeOption(dataMode: DataMode) {
  return demoDataModeOptions.find((option) => option.value === dataMode) ?? demoDataModeOptions[0];
}

export function getValidationStatusTone(status: ValidationStatus): BadgeTone {
  if (status === "passed") {
    return "cyan";
  }
  if (status === "failed") {
    return "warning";
  }
  return "blue";
}

export async function checkSystemHealth() {
  return apiGet<SystemHealthInfo>("/health");
}
