import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SourceBadge } from "@/components/business/SourceBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Panel } from "@/components/ui/Panel";
import { useToast } from "@/hooks/useToast";
import { getCareerVaultPath } from "@/services/careerVaultService";
import { getInterviewGuidePath } from "@/services/interviewGuideService";
import {
  getDecisionCard,
  getJobById,
  getRecruiterLens,
} from "@/services/jobDecisionService";
import { getPipelineAddToast } from "@/services/pipelineNoticeService";
import { getResumeStudioPath } from "@/services/resumeStudioService";
import { useCareerVaultStore } from "@/stores/careerVaultStore";
import { usePipelineStore } from "@/stores/pipelineStore";
import type { JobDecisionCard, RecruiterLens } from "@/types/demo";

export function JobDecisionPage() {
  const navigate = useNavigate();
  const { jobId = "" } = useParams();
  const { showToast } = useToast();
  const vaultItems = useCareerVaultStore((state) => state.items);
  const addJobToPipeline = usePipelineStore((state) => state.addJob);
  const job = getJobById(jobId);
  const decision = getDecisionCard(job);
  const lens = getRecruiterLens(job);
  const validEvidenceIds = useMemo(() => new Set(vaultItems.map((item) => item.id)), [vaultItems]);
  const primaryEvidenceId = decision.gaps.find((gap) => validEvidenceIds.has(gap.evidence_id))?.evidence_id;

  const handleAddJobToPipeline = () => {
    const result = addJobToPipeline(job);
    showToast(getPipelineAddToast(job, result));
    navigate(`/pipeline?job=${job.id}`);
  };

  return (
    <div className="space-y-6">
      <Card as="section" surface="hero" className="p-6">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge tone="cyan">岗位决策卡</Badge>
              <SourceBadge source={job.source} />
              <Badge tone="blue">{decision.priority}</Badge>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{job.title}</h1>
            <p className="mt-4 text-base leading-8 text-slate-400">
              {job.company} · {job.city} · {job.salary} · {job.direction}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={handleAddJobToPipeline}>
                加入求职管线
              </Button>
              <Button asChild variant="secondary">
                <Link to={getCareerVaultPath(primaryEvidenceId)}>补充职业素材</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to={getResumeStudioPath(job.id)}>生成定制简历</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to={getInterviewGuidePath(job.id)}>生成面试作战卡</Link>
              </Button>
            </div>
          </div>
          <Card className="border-cyanGlow/20 bg-ink-900/80 p-5">
            <div className="text-sm text-slate-400">决策结论</div>
            <div className="mt-2 text-4xl font-semibold text-cyanGlow">{decision.decision}</div>
            <div className="mt-1 text-sm text-slate-500">综合等级 {decision.overall_grade}</div>
            <ScoreGrid scores={decision.scores} />
          </Card>
        </div>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="命中理由">
          <List items={decision.hit_reasons} tone="cyan" />
        </Panel>
        <Panel title="风险与修复建议">
          <div className="space-y-3">
            {decision.risks.map((risk) => (
              <Card key={`${risk.type}-${risk.text}`} surface="subtle" className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{risk.type}</div>
                  <Badge tone={risk.level === "高" ? "danger" : risk.level === "中" ? "warning" : "muted"}>
                    {risk.level}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{risk.text}</p>
                <Button asChild className="mt-4" size="sm" variant="secondary">
                  <Link to={getCareerVaultPath(risk.evidence_id ?? primaryEvidenceId)}>{risk.fix_action}</Link>
                </Button>
              </Card>
            ))}
          </div>
        </Panel>
      </section>

      <Panel title="证据缺口">
        <div className="grid gap-3 md:grid-cols-2">
          {decision.gaps.map((gap) => (
            <Card key={gap.evidence_id} surface="subtle" className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Badge tone={validEvidenceIds.has(gap.evidence_id) ? "cyan" : "muted"}>
                  {validEvidenceIds.has(gap.evidence_id) ? "证据可用" : "证据已失效"}
                </Badge>
              </div>
              <p className="text-sm leading-6 text-slate-400">{gap.text}</p>
              <Button asChild className="mt-4" size="sm" variant="secondary">
                <Link to={getCareerVaultPath(gap.evidence_id)}>
                  {validEvidenceIds.has(gap.evidence_id) ? "查看对应素材" : "补充缺失素材"}
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      </Panel>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel title="建议行动">
          <div className="space-y-3">
            {decision.next_actions.map((action) =>
              action.target_path === "/pipeline" ? (
                <Button key={action.label} className="w-full" variant="secondary" onClick={handleAddJobToPipeline}>
                  {action.label}
                </Button>
              ) : (
                <Button key={action.label} asChild className="w-full" variant="secondary">
                  <Link to={action.target_path === "/interview" ? getInterviewGuidePath(job.id) : action.target_path}>
                    {action.label}
                  </Link>
                </Button>
              ),
            )}
          </div>
        </Panel>
        <RecruiterLensPanel lens={lens} />
      </section>
    </div>
  );
}

function ScoreGrid({ scores }: { scores: JobDecisionCard["scores"] }) {
  const items = [
    ["匹配度", scores.match],
    ["岗位质量", scores.job_quality],
    ["成长性", scores.growth],
    ["薪资吸引", scores.salary],
    ["竞争风险", scores.competition_risk],
    ["投递成本", scores.apply_cost],
  ];

  return (
    <div className="mt-5 grid grid-cols-2 gap-3">
      {items.map(([label, value]) => (
        <Card key={label} surface="subtle" className="p-3">
          <div className="text-xs text-slate-500">{label}</div>
          <div className="mt-1 text-xl font-semibold">{value}</div>
        </Card>
      ))}
    </div>
  );
}

function List({ items, tone }: { items: string[]; tone: "cyan" | "blue" }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <Card key={item} surface="subtle" className="p-4">
          <Badge tone={tone} className="mb-3 px-2 py-0.5 text-xs">
            #{index + 1}
          </Badge>
          <p className="text-sm leading-6 text-slate-300">{item}</p>
        </Card>
      ))}
    </div>
  );
}

function RecruiterLensPanel({ lens }: { lens: RecruiterLens }) {
  return (
    <Panel title="招聘官视角">
      <Card surface="subtle" className="mb-4 p-4">
        <div className="text-sm text-slate-500">第一眼印象</div>
        <p className="mt-2 text-sm leading-6 text-slate-300">{lens.first_impression}</p>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <LensBlock title="亮点" items={lens.highlights} />
        <LensBlock title="疑点" items={lens.concerns} />
        <LensBlock title="可能追问" items={lens.likely_questions} />
        <LensBlock title="提升建议" items={lens.improve_tips} />
      </div>
    </Panel>
  );
}

function LensBlock({ items, title }: { items: string[]; title: string }) {
  return (
    <Card surface="subtle" className="p-4">
      <div className="mb-3 font-medium">{title}</div>
      <ul className="space-y-2 text-sm leading-6 text-slate-400">
        {items.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </Card>
  );
}
