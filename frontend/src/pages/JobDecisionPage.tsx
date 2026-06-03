import { Link, useParams } from "react-router-dom";
import { SourceBadge } from "@/components/business/SourceBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Panel } from "@/components/ui/Panel";
import { demoData } from "@/data/demoData";
import type { DemoJob, JobDecisionCard, RecruiterLens } from "@/types/demo";

const validEvidenceIds = new Set(["ev_rag_project"]);

export function JobDecisionPage() {
  const { jobId = "" } = useParams();
  const job = demoData.jobs.items.find((item) => item.id === jobId) ?? demoData.jobs.items[0];
  const decision = getDecisionCard(job);
  const lens = getRecruiterLens(job);

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
              <Button asChild>
                <Link to="/pipeline">加入求职管线</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/resume">补充职业素材</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/interview">生成面试作战卡</Link>
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
                  <Link to="/resume">{risk.fix_action}</Link>
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
                <Link to="/resume">跳转职业素材库</Link>
              </Button>
            </Card>
          ))}
        </div>
      </Panel>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel title="建议行动">
          <div className="space-y-3">
            {decision.next_actions.map((action) => (
              <Button key={action.label} asChild className="w-full" variant="secondary">
                <Link to={action.target_path}>{action.label}</Link>
              </Button>
            ))}
          </div>
        </Panel>
        <RecruiterLensPanel lens={lens} />
      </section>
    </div>
  );
}

function getDecisionCard(job: DemoJob): JobDecisionCard {
  return (
    demoData.decisionCards.items.find((item) => item.job_id === job.id) ?? {
      job_id: job.id,
      decision: job.match >= 85 ? "推荐" : "观望",
      priority: job.priority,
      overall_grade: job.match >= 85 ? "A-" : "B",
      scores: {
        match: job.match,
        job_quality: 78,
        growth: 76,
        salary: 70,
        competition_risk: 60,
        apply_cost: 40,
      },
      hit_reasons: [
        "岗位方向与当前求职身份存在交集。",
        "岗位信息来自 Mock 兜底数据，页面结构可稳定演示。",
        "后续算法接口接入后可替换为真实决策结果。",
      ],
      gaps: [{ evidence_id: "ev_missing", text: "当前岗位暂无完整证据链，建议补充职业素材后重新分析。" }],
      risks: [
        {
          fix_action: "补充职业素材库",
          level: "中",
          text: "决策数据使用 Mock 兜底，解释深度有限。",
          type: "数据不足",
        },
      ],
      next_actions: [
        { label: "加入求职管线", target_path: "/pipeline" },
        { label: "补充职业素材", target_path: "/resume" },
        { label: "准备面试作战卡", target_path: "/interview" },
      ],
    }
  );
}

function getRecruiterLens(job: DemoJob): RecruiterLens {
  return (
    demoData.recruiterLens.items.find((item) => item.job_id === job.id) ?? {
      job_id: job.id,
      first_impression: "招聘官会优先查看岗位关键词、项目证据和最近经历是否匹配。",
      highlights: ["方向相关", "具备可迁移项目经验", "适合进入进一步评估"],
      concerns: ["证据链不足", "量化结果不够", "岗位细节需要进一步确认"],
      likely_questions: ["你为什么适合这个岗位？", "最能证明能力的项目是什么？", "你如何补齐岗位短板？"],
      improve_tips: ["补充项目证据", "突出量化成果", "准备岗位相关案例"],
    }
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
