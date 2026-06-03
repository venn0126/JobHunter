import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { ResumeStudioSection } from "@/types/demo";

export function ResumeStudioPreview({
  defaultVersionName,
  sections,
  versionName,
}: {
  defaultVersionName: string;
  sections: ResumeStudioSection[];
  versionName: string;
}) {
  return (
    <Card surface="subtle" className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm text-slate-500">当前版本草稿</div>
          <div className="mt-1 text-lg font-semibold">{versionName || defaultVersionName}</div>
        </div>
        <Badge tone={sections.length ? "cyan" : "muted"}>{sections.length} 条已纳入</Badge>
      </div>

      <div className="mt-4 space-y-3">
        {sections.length ? (
          sections.map((section) => (
            <Card key={section.id} surface="subtle" className="p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge tone="blue" className="px-2 py-0.5 text-xs">
                  {section.section}
                </Badge>
                <span className="text-xs text-slate-500">{section.status}</span>
              </div>
              <p className="text-sm leading-7 text-slate-300">{section.after}</p>
            </Card>
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-400">
            暂无纳入内容。接受至少一条修改后，可保存为新简历版本。
          </div>
        )}
      </div>
    </Card>
  );
}
