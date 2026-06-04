import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { appConfig } from "@/config/env";
import { storageKeys } from "@/lib/storageKeys";
import type { DataMode } from "@/types/common";

interface AppState {
  dataMode: DataMode;
  resetDataMode: () => void;
  setDataMode: (dataMode: DataMode) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      dataMode: appConfig.dataMode,
      resetDataMode: () => set({ dataMode: appConfig.dataMode }),
      setDataMode: (dataMode) => set({ dataMode }),
    }),
    {
      name: storageKeys.app,
      partialize: (state) => ({ dataMode: state.dataMode }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
