import type { DashboardRadarItem } from "@/types/demo";

export function AbilityRadar({ items }: { items: DashboardRadarItem[] }) {
  return (
    <div className="space-y-4">
      <div className="relative mx-auto flex aspect-square max-w-72 items-center justify-center rounded-full border border-cyanGlow/20 bg-[radial-gradient(circle,rgba(53,242,208,0.18),rgba(74,163,255,0.06)_48%,transparent_70%)]">
        <div className="absolute inset-8 rounded-full border border-white/10" />
        <div className="absolute inset-16 rounded-full border border-white/10" />
        <div className="text-center">
          <div className="text-5xl font-semibold text-cyanGlow">86</div>
          <div className="mt-1 text-sm text-slate-400">综合作战分</div>
        </div>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
              <span>{item.label}</span>
              <span>{item.value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/8">
              <div className="h-full rounded-full bg-gradient-to-r from-cyanGlow to-blueGlow" style={{ width: `${item.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
