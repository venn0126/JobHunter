import { enableDemoMode } from "@/lib/demoMode";
import { clearUpdateRestorePath } from "@/lib/updateRestore";
import { useAuthStore } from "@/stores/authStore";
import { useCareerVaultStore } from "@/stores/careerVaultStore";
import { useJobStore } from "@/stores/jobStore";
import { usePersonaStore } from "@/stores/personaStore";
import { usePipelineStore } from "@/stores/pipelineStore";

export interface DemoResetResult {
  message: string;
}

export function resetDemoWorkspace(): DemoResetResult {
  useAuthStore.getState().resetDemoSession();
  usePersonaStore.getState().resetDemoPersona();
  useJobStore.getState().resetDemo();
  useCareerVaultStore.getState().resetDemo();
  usePipelineStore.getState().resetDemo();
  clearUpdateRestorePath();
  enableDemoMode();

  return {
    message: "已恢复标准 Demo：账号、身份、岗位筛选、职业素材和求职管线。",
  };
}
