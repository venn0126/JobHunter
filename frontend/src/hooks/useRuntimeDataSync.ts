import { useEffect } from "react";
import { syncRuntimeData } from "@/services/bootstrapDataService";
import { useAppStore } from "@/stores/appStore";

let runtimeSyncSeq = 0;

export function useRuntimeDataSync() {
  const dataMode = useAppStore((state) => state.dataMode);

  useEffect(() => {
    const seq = ++runtimeSyncSeq;
    void syncRuntimeData(dataMode).catch((error) => {
      if (seq === runtimeSyncSeq) {
        console.error("[runtime-data-sync]", error);
      }
    });
  }, [dataMode]);
}
