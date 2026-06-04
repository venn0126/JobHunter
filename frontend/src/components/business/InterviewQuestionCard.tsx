import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getCareerVaultPath } from "@/services/careerVaultService";
import type { CareerVaultItem, InterviewGuideQuestion } from "@/types/demo";

export function InterviewQuestionCard({
  evidenceLinks,
  jobId,
  question,
}: {
  evidenceLinks: Array<{
    evidenceId: string;
    item?: CareerVaultItem;
  }>;
  jobId: string;
  question: InterviewGuideQuestion;
}) {
  return (
    <Card surface="subtle" className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge tone="cyan">高频问题</Badge>
            <span className="text-xs text-slate-500">{question.intent}</span>
          </div>
          <h3 className="text-lg font-semibold">{question.question}</h3>
        </div>
        <Badge tone="warning">风险提醒</Badge>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <Card surface="subtle" className="p-4">
          <div className="mb-3 text-sm text-slate-500">回答框架</div>
          <ol className="space-y-3 text-sm leading-6 text-slate-300">
            {question.framework.map((item, index) => (
              <li key={item} className="flex gap-3">
                <Badge tone="blue" className="h-7 px-2 py-0.5 text-xs">
                  {index + 1}
                </Badge>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card surface="subtle" className="p-4">
          <div className="mb-3 text-sm text-slate-500">关联项目证据</div>
          <div className="space-y-3">
            {evidenceLinks.map(({ evidenceId, item }) => (
              <Link
                className="block rounded-2xl border border-cyanGlow/20 bg-cyanGlow/10 p-3 transition hover:border-cyanGlow/40"
                key={`${question.id}-${evidenceId}`}
                to={getCareerVaultPath(evidenceId, { jobId })}
              >
                <div className="font-medium text-cyanGlow">{item?.title ?? evidenceId}</div>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-300">
                  {item?.impact ?? "当前证据暂未收录，可跳转职业素材库补齐。"}
                </p>
              </Link>
            ))}
          </div>
          <Card surface="subtle" className="mt-4 border-risk-medium/20 bg-risk-medium/10 p-3">
            <div className="text-xs text-risk-medium">回答风险</div>
            <p className="mt-2 text-sm leading-6 text-slate-300">{question.risk_tip}</p>
          </Card>
        </Card>
      </div>
    </Card>
  );
}
