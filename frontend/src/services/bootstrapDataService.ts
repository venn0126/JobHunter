import { demoData, type DemoBootstrapData } from "@/data/demoData";
import { apiGet } from "@/services/apiClient";
import { syncWorkspaceStoresFromRuntimeData } from "@/services/workspaceStoreSyncService";
import { useAppStore } from "@/stores/appStore";
import { useRuntimeDataStore } from "@/stores/runtimeDataStore";
import type { DataMode, PipelineStatus } from "@/types/common";
import type { ApplicationFeedbackReview, CareerVaultItem, PipelineSummary, ResumeLab } from "@/types/demo";

interface PipelineReadResponse {
  entries: Array<{
    addedAt: string;
    job: DemoBootstrapData["jobs"]["items"][number];
    nextAction: string;
    status: PipelineStatus;
    updatedAt: string;
  }>;
  summary: PipelineSummary[];
}

interface ItemListResponse<T> {
  items: T[];
}

export function shouldLoadApiData(dataMode: DataMode) {
  return dataMode === "api" || dataMode === "hybrid";
}

export async function syncRuntimeData(dataMode = useAppStore.getState().dataMode) {
  const runtimeStore = useRuntimeDataStore.getState();
  if (!shouldLoadApiData(dataMode)) {
    runtimeStore.setRuntimeData(demoData, "mock");
    syncWorkspaceStoresFromRuntimeData();
    return { data: demoData, mode: "mock" as const };
  }

  runtimeStore.setRuntimeLoading(true);
  try {
    const data = await loadApiRuntimeData();
    runtimeStore.setRuntimeData(data.bootstrap, "api");
    syncWorkspaceStoresFromRuntimeData({ pipelineEntries: data.pipeline.entries });
    return { data: data.bootstrap, mode: "api" as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown api bootstrap error";
    if (dataMode === "api") {
      runtimeStore.setRuntimeError(message);
      throw error;
    }
    runtimeStore.setRuntimeData(demoData, "mock");
    syncWorkspaceStoresFromRuntimeData();
    runtimeStore.setRuntimeError(`hybrid fallback: ${message}`);
    return { data: demoData, mode: "mock" as const };
  }
}

async function loadApiRuntimeData() {
  const [bootstrap, pipeline, vault, feedbackReview, resumeLab] = await Promise.all([
    apiGet<DemoBootstrapData>("/mock/bootstrap"),
    apiGet<PipelineReadResponse>("/pipeline"),
    apiGet<ItemListResponse<CareerVaultItem>>("/vault?page=1&page_size=100"),
    apiGet<ApplicationFeedbackReview>("/feedback"),
    apiGet<ResumeLab>("/resume-lab"),
  ]);

  return {
    bootstrap: {
      ...bootstrap,
      careerVault: { items: vault.items },
      feedbackReview,
      resumeLab,
    },
    pipeline,
  };
}
