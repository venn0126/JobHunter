import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  feedbackOutcomeLabel,
  feedbackOutcomeTone,
  type FeedbackRecordView,
} from "@/services/feedbackReviewService";
import { getInterviewGuidePath } from "@/services/interviewGuideService";
import { getResumeLabPath } from "@/services/resumeLabService";

export function FeedbackRecordCard({ view }: { view: FeedbackRecordView }) {
  const { job, record, resumeVersion } = view;

  return (
    <Card surface="subtle" className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge tone={feedbackOutcomeTone[record.outcome]}>{feedbackOutcomeLabel[record.outcome]}</Badge>
            <Badge tone="muted">{record.channel}</Badge>
          </div>
          <h3 className="text-lg font-semibold">{job?.title ?? record.job_id}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {job?.company ?? "未知公司"} · {record.stage}
          </p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <div>投递：{record.applied_at}</div>
          <div className="mt-1">更新：{record.updated_at}</div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-300">{record.notes}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {record.feedback_tags.map((tag) => (
          <Badge key={tag} tone="blue" className="px-2 py-0.5 text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      <Card surface="subtle" className="mt-4 border-cyanGlow/20 bg-cyanGlow/10 p-3">
        <div className="text-xs text-cyanGlow">下一步</div>
        <p className="mt-2 text-sm leading-6 text-slate-300">{record.next_action}</p>
      </Card>

      <div className="mt-4 flex flex-wrap gap-3">
        {job ? (
          <Button asChild size="sm" variant="secondary">
            <Link to={`/jobs/${job.id}`}>岗位决策卡</Link>
          </Button>
        ) : null}
        {resumeVersion ? (
          <Button asChild size="sm" variant="secondary">
            <Link to={getResumeLabPath(resumeVersion.id)}>简历版本</Link>
          </Button>
        ) : null}
        {record.outcome === "interview" && job ? (
          <Button asChild size="sm" variant="secondary">
            <Link to={getInterviewGuidePath(job.id)}>面试作战卡</Link>
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
