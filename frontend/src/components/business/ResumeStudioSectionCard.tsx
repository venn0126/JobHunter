import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { CareerVaultItem, ResumeEvidenceRef, ResumeStudioSection } from "@/types/demo";

interface ResumeEvidenceLink {
  item?: CareerVaultItem;
  reference: ResumeEvidenceRef;
}

export function ResumeStudioSectionCard({
  accepted,
  evidenceLinks,
  onAccept,
  onCopy,
  onRevoke,
  section,
  toEvidencePath,
}: {
  accepted: boolean;
  evidenceLinks: ResumeEvidenceLink[];
  onAccept: () => void;
  onCopy: () => void;
  onRevoke: () => void;
  section: ResumeStudioSection;
  toEvidencePath: (evidenceId?: string) => string;
}) {
  const hasEvidence = evidenceLinks.length > 0;

  return (
    <Card surface="subtle" className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={section.status === "可直接使用" ? "cyan" : "warning"}>{section.status}</Badge>
          <h3 className="text-lg font-semibold">{section.section}</h3>
        </div>
        <Badge tone={accepted ? "blue" : "muted"}>{accepted ? "已纳入版本" : "暂未纳入"}</Badge>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr_1fr]">
        <ResumeTextBlock title="修改前" value={section.before || "原简历未覆盖该内容。"} />
        <Card surface="subtle" className="border-blueGlow/20 bg-blueGlow/10 p-4">
          <div className="text-xs text-slate-500">修改原因</div>
          <p className="mt-2 text-sm leading-6 text-slate-300">{section.reason}</p>
          <div className="mt-4">
            <div className="mb-2 text-xs text-slate-500">证据引用</div>
            {hasEvidence ? (
              <div className="space-y-2">
                {evidenceLinks.map(({ item, reference }) => (
                  <Link
                    className="block rounded-2xl border border-cyanGlow/20 bg-cyanGlow/10 p-3 text-sm transition hover:border-cyanGlow/40"
                    key={`${section.id}-${reference.source_id}`}
                    to={toEvidencePath(reference.source_id)}
                  >
                    <div className="font-medium text-cyanGlow">{item?.title ?? reference.source_id}</div>
                    <div className="mt-1 line-clamp-2 leading-6 text-slate-300">{reference.quote}</div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-risk-medium/20 bg-risk-medium/10 p-3 text-sm leading-6 text-slate-300">
                暂无直接证据，请先补充职业素材，再作为可直接使用内容。
              </div>
            )}
          </div>
        </Card>
        <ResumeTextBlock title="优化后" value={section.after} />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button size="sm" onClick={onAccept}>
          接受修改
        </Button>
        <Button size="sm" variant="secondary" onClick={onRevoke}>
          撤回修改
        </Button>
        <Button size="sm" variant="secondary" onClick={onCopy}>
          复制优化后片段
        </Button>
        {!hasEvidence ? (
          <Button asChild size="sm" variant="secondary">
            <Link to={toEvidencePath(section.missing_evidence_id)}>补充证据素材</Link>
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

function ResumeTextBlock({ title, value }: { title: string; value: string }) {
  return (
    <Card surface="subtle" className="p-4">
      <div className="mb-2 text-xs text-slate-500">{title}</div>
      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{value}</p>
    </Card>
  );
}
