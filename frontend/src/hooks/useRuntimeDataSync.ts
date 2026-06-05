import { useEffect } from "react";
import { syncRuntimeData } from "@/services/bootstrapDataService";
import { useAppStore } from "@/stores/appStore";

export function useRuntimeDataSync() {
  const dataMode = useAppStore((state) => state.dataMode);

  useEffect(() => {
    void syncRuntimeData(dataMode);
  }, [dataMode]);
}
