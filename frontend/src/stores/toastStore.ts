import { create } from "zustand";

export type ToastTone = "danger" | "info" | "success" | "warning";

export interface AppToast {
  id: string;
  message?: string;
  title: string;
  tone: ToastTone;
}

export interface ToastInput {
  durationMs?: number;
  message?: string;
  title: string;
  tone?: ToastTone;
}

interface ToastState {
  dismissToast: (toastId: string) => void;
  showToast: (toast: ToastInput) => string;
  toasts: AppToast[];
}

const defaultToastDurationMs = 2600;
const toastTimers = new Map<string, number>();

function createToastId() {
  return globalThis.crypto?.randomUUID?.() ?? `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function clearToastTimer(toastId: string) {
  const timerId = toastTimers.get(toastId);
  if (timerId !== undefined) {
    window.clearTimeout(timerId);
    toastTimers.delete(toastId);
  }
}

export const useToastStore = create<ToastState>((set, get) => ({
  dismissToast: (toastId) => {
    clearToastTimer(toastId);
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== toastId),
    }));
  },
  showToast: ({ durationMs = defaultToastDurationMs, message, title, tone = "success" }) => {
    const toastId = createToastId();
    set((state) => {
      const nextToasts = [...state.toasts, { id: toastId, message, title, tone }].slice(-3);
      const nextToastIds = new Set(nextToasts.map((toast) => toast.id));
      state.toasts.forEach((toast) => {
        if (!nextToastIds.has(toast.id)) {
          clearToastTimer(toast.id);
        }
      });

      return { toasts: nextToasts };
    });

    const timerId = window.setTimeout(() => get().dismissToast(toastId), durationMs);
    toastTimers.set(toastId, timerId);

    return toastId;
  },
  toasts: [],
}));
