import { Link, useSearchParams } from "react-router-dom";
import { InterviewQuestionCard } from "@/components/business/InterviewQuestionCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Panel } from "@/components/ui/Panel";
import { getInterviewGuide, getInterviewQuestionEvidence } from "@/services/interviewGuideService";
import { getJobById } from "@/services/jobDecisionService";
import { getResumeStudioPath } from "@/services/resumeStudioService";
import { useCareerVaultStore } from "@/stores/careerVaultStore";

export function InterviewGuidePage() {
  const [searchParams] = useSearchParams();
  const requestedJobId = searchParams.get("job") ?? undefined;
  const guide = getInterviewGuide(requestedJobId);
  const job = getJobById(guide.job_id);
  const vaultItems = useCareerVaultStore((state) => state.items);

  return (
    <div className="space-y-6">
      <Card as="section" surface="hero" className="p-6">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge tone="cyan">P1-D 面试作战卡</Badge>
              <Badge tone="blue">{job.priority}</Badge>
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              围绕 {job.company} 的面试风险提前演练。
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">
              基于岗位决策卡、简历证据和职业素材，整理公司简报、面试重点、高频问题、回答框架和反问建议。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to={`/jobs/${job.id}`}>返回岗位决策卡</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to={getResumeStudioPath(job.id)}>回到简历工作室</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/feedback">面后记录反馈</Link>
              </Button>
            </div>
          </div>
          <Card className="border-cyanGlow/20 bg-ink-900/80 p-5">
            <div className="text-sm text-slate-400">目标岗位</div>
            <div className="mt-2 text-3xl font-semibold text-cyanGlow">{job.title}</div>
            <div className="mt-2 text-sm leading-6 text-slate-400">
              {job.company} / {job.city} / {job.salary}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="cyan">{job.direction}</Badge>
              <Badge tone="blue">匹配度 {job.match}%</Badge>
            </div>
          </Card>
        </div>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="公司简报">
          <div className="space-y-4">
            <BriefBlock label="业务背景" value={guide.company_brief.business} />
            <BriefBlock label="岗位关注" value={guide.company_brief.role_focus} />
            <BriefBlock label="面试风格" value={guide.company_brief.interview_style} />
          </div>
        </Panel>

        <Panel title="面试重点">
          <div className="grid gap-3 md:grid-cols-2">
            {guide.interview_focus.map((focus, index) => (
              <Card key={focus} surface="subtle" className="p-4">
                <Badge tone="cyan" className="mb-3 px-2 py-0.5 text-xs">
                  重点 {index + 1}
                </Badge>
                <p className="text-sm leading-6 text-slate-300">{focus}</p>
              </Card>
            ))}
          </div>
        </Panel>
      </section>

      <Panel title="高频问题与回答框架">
        {guide.questions.length > 0 ? (
          <div className="space-y-4">
            {guide.questions.map((question) => (
              <InterviewQuestionCard
                evidenceLinks={getInterviewQuestionEvidence(question, vaultItems)}
                jobId={job.id}
                key={question.id}
                question={question}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="暂无面试题"
            description="当前岗位还没有生成面试作战卡，可先返回岗位决策卡补充职业素材。"
            action={
              <Button asChild>
                <Link to={`/jobs/${job.id}`}>返回岗位决策卡</Link>
              </Button>
            }
          />
        )}
      </Panel>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="7 天准备计划预览">
          <div className="space-y-3">
            {guide.seven_day_plan.map((item) => (
              <Card key={item.day} surface="subtle" className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="blue">Day {item.day}</Badge>
                  <div className="font-medium">{item.title}</div>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.focus}</p>
              </Card>
            ))}
          </div>
        </Panel>

        <Panel title="反问面试官建议">
          <div className="space-y-3">
            {guide.reverse_questions.map((question, index) => (
              <Card key={question} surface="subtle" className="p-4">
                <Badge tone="cyan" className="mb-3 px-2 py-0.5 text-xs">
                  反问 {index + 1}
                </Badge>
                <p className="text-sm leading-6 text-slate-300">{question}</p>
              </Card>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function BriefBlock({ label, value }: { label: string; value: string }) {
  return (
    <Card surface="subtle" className="p-4">
      <div className="mb-2 text-xs text-slate-500">{label}</div>
      <p className="text-sm leading-6 text-slate-300">{value}</p>
    </Card>
  );
}
