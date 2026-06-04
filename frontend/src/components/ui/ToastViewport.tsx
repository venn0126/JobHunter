import { Toast } from "@/components/ui/Toast";
import { useToastStore } from "@/stores/toastStore";

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-24 z-[80] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-8">
      {toasts.map((toast) => (
        <div className="pointer-events-auto" key={toast.id}>
          <Toast message={toast.message} title={toast.title} tone={toast.tone} />
        </div>
      ))}
    </div>
  );
}
