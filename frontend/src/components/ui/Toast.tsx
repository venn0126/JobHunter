import { Card } from "@/components/ui/Card";

export function Toast({ message, title }: { message: string; title: string }) {
  return (
    <Card className="fixed bottom-6 right-6 z-50 max-w-sm p-4 shadow-card">
      <div className="font-medium text-white">{title}</div>
      <div className="mt-1 text-sm leading-6 text-slate-400">{message}</div>
    </Card>
  );
}
