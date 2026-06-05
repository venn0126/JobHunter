import { create } from "zustand";
import { demoData, type DemoBootstrapData } from "@/data/demoData";

interface RuntimeDataState {
  data: DemoBootstrapData;
  error: string;
  loading: boolean;
  mode: "api" | "mock";
  resetRuntimeData: () => void;
  setRuntimeData: (data: DemoBootstrapData, mode: RuntimeDataState["mode"]) => void;
  setRuntimeError: (error: string) => void;
  setRuntimeLoading: (loading: boolean) => void;
}

export const useRuntimeDataStore = create<RuntimeDataState>((set) => ({
  data: demoData,
  error: "",
  loading: false,
  mode: "mock",
  resetRuntimeData: () => set({ data: demoData, error: "", loading: false, mode: "mock" }),
  setRuntimeData: (data, mode) => set({ data, error: "", loading: false, mode }),
  setRuntimeError: (error) => set({ error, loading: false }),
  setRuntimeLoading: (loading) => set({ loading }),
}));

export function getRuntimeData() {
  return useRuntimeDataStore.getState().data;
}

export function useRuntimeData() {
  return useRuntimeDataStore((state) => state.data);
}
