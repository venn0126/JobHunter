import { create } from "zustand";
import { demoData } from "@/data/demoData";
import type { CareerVaultItem } from "@/types/demo";

interface CareerVaultState {
  items: CareerVaultItem[];
  selectedItemId: string;
  addItem: (item: Omit<CareerVaultItem, "id">, itemId?: string) => void;
  deleteItem: (itemId: string) => void;
  loadDemoItems: () => void;
  selectItem: (itemId: string) => void;
  updateItem: (itemId: string, patch: Partial<CareerVaultItem>) => void;
}

function cloneVaultItems() {
  return demoData.careerVault.items.map((item) => ({
    ...item,
    skills: [...item.skills],
    star: { ...item.star },
    tags: [...item.tags],
  }));
}

function createVaultItemId() {
  return globalThis.crypto?.randomUUID?.() ?? `ev_custom_${Date.now()}`;
}

const initialItems = cloneVaultItems();

export const useCareerVaultStore = create<CareerVaultState>((set) => ({
  items: initialItems,
  selectedItemId: initialItems[0]?.id ?? "",
  addItem: (item, itemId) =>
    set((state) => {
      const id = itemId ?? createVaultItemId();
      return {
        items: [{ ...item, id }, ...state.items],
        selectedItemId: id,
      };
    }),
  deleteItem: (itemId) =>
    set((state) => {
      const nextItems = state.items.filter((item) => item.id !== itemId);
      return {
        items: nextItems,
        selectedItemId: state.selectedItemId === itemId ? nextItems[0]?.id ?? "" : state.selectedItemId,
      };
    }),
  loadDemoItems: () => {
    const items = cloneVaultItems();
    set({
      items,
      selectedItemId: items[0]?.id ?? "",
    });
  },
  selectItem: (itemId) => set({ selectedItemId: itemId }),
  updateItem: (itemId, patch) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    })),
}));

export function createBlankVaultItem(evidenceId?: string): Omit<CareerVaultItem, "id"> {
  return {
    impact: "待补充量化结果",
    skills: ["RAG", "后端服务"],
    star: {
      action: "待补充行动",
      result: "待补充结果",
      situation: "待补充背景",
      task: "待补充任务",
    },
    summary: evidenceId
      ? "请补充这条证据的背景、行动和结果，用于修复岗位决策卡风险。"
      : "新增职业素材摘要",
    tags: evidenceId ? ["待补充证据"] : ["Demo 素材"],
    title: evidenceId ? `补充证据：${evidenceId}` : "新增职业素材",
    type: "project",
  };
}
