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

interface RuntimeDataSyncResult {
  data: DemoBootstrapData;
  mode: "api" | "mock";
}

let activeRuntimeSyncId = 0;

export function shouldLoadApiData(dataMode: DataMode) {
  return dataMode === "api" || dataMode === "hybrid";
}

export async function syncRuntimeData(dataMode = useAppStore.getState().dataMode): Promise<RuntimeDataSyncResult> {
  const syncId = ++activeRuntimeSyncId;
  const runtimeStore = useRuntimeDataStore.getState();
  if (!shouldLoadApiData(dataMode)) {
    applyRuntimeDataSync(syncId, demoData, "mock");
    return { data: demoData, mode: "mock" };
  }

  runtimeStore.setRuntimeLoading(true);
  try {
    const data = await loadApiRuntimeData();
    applyRuntimeDataSync(syncId, data.bootstrap, "api", { pipelineEntries: data.pipeline.entries });
    return { data: data.bootstrap, mode: "api" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown api bootstrap error";
    applyRuntimeDataSync(syncId, demoData, "mock", { error: `${dataMode} fallback: ${message}` });
    return { data: demoData, mode: "mock" };
  }
}

function applyRuntimeDataSync(
  syncId: number,
  data: DemoBootstrapData,
  mode: RuntimeDataSyncResult["mode"],
  options: { error?: string; pipelineEntries?: PipelineReadResponse["entries"] } = {},
) {
  if (syncId !== activeRuntimeSyncId) {
    return;
  }

  const runtimeStore = useRuntimeDataStore.getState();
  runtimeStore.setRuntimeData(data, mode);
  syncWorkspaceStoresFromRuntimeData({ pipelineEntries: options.pipelineEntries });
  if (options.error) {
    runtimeStore.setRuntimeError(options.error);
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
