import { create } from "zustand";
import { appConfig } from "@/config/env";
import type { DataMode } from "@/types/common";

interface AppState {
  dataMode: DataMode;
  setDataMode: (dataMode: DataMode) => void;
}

export const useAppStore = create<AppState>((set) => ({
  dataMode: appConfig.dataMode,
  setDataMode: (dataMode) => set({ dataMode }),
}));
