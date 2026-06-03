import { Card } from "@/components/ui/Card";

export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <Card as="section" surface="hero" className="p-8">
      <div className="text-sm text-cyanGlow">P0 待开发模块</div>
      <h1 className="mt-3 text-3xl font-semibold">{title}</h1>
      <p className="mt-4 max-w-2xl leading-8 text-slate-400">{description}</p>
      <Card surface="subtle" className="mt-8 p-5 text-sm text-slate-300">
        当前阶段只完成 P0 4.1 工程基建。下一小节开始会按清单逐步替换占位页。
      </Card>
    </Card>
  );
}
