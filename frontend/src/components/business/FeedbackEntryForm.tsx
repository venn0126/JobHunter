import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/hooks/useToast";
import {
  feedbackOutcomeOptions,
  feedbackOutcomeLabel,
  feedbackOutcomePipelineStatus,
  feedbackOutcomeTone,
  getDefaultFeedbackNextAction,
  getDefaultFeedbackNotes,
  parseFeedbackTags,
} from "@/services/feedbackReviewService";
import { useFeedbackReviewStore } from "@/stores/feedbackReviewStore";
import { pipelineStatusLabel, usePipelineStore } from "@/stores/pipelineStore";
import type { ApplicationFeedbackOutcome, DemoJob, ResumeLabVersion } from "@/types/demo";

export function FeedbackEntryForm({
  jobs,
  resumeVersions,
}: {
  jobs: DemoJob[];
  resumeVersions: ResumeLabVersion[];
}) {
  const { showToast } = useToast();
  const upsertRecord = useFeedbackReviewStore((state) => state.upsertRecord);
  const syncEntry = usePipelineStore((state) => state.syncEntry);
  const [jobId, setJobId] = useState(jobs[0]?.id ?? "");
  const [outcome, setOutcome] = useState<ApplicationFeedbackOutcome>("interview");
  const [resumeVersionId, setResumeVersionId] = useState(resumeVersions[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [feedbackTagsText, setFeedbackTagsText] = useState("RAG 项目命中、需要跟进");
  const selectedJob = useMemo(() => jobs.find((job) => job.id === jobId), [jobId, jobs]);
  const selectedResumeVersion = useMemo(
    () => resumeVersions.find((version) => version.id === resumeVersionId),
    [resumeVersionId, resumeVersions],
  );
  const pipelineStatus = feedbackOutcomePipelineStatus[outcome];

  const handleSubmit = () => {
    if (!selectedJob || !selectedResumeVersion) {
      showToast({ title: "请选择岗位和简历版本", tone: "warning" });
      return;
    }

    const record = upsertRecord({
      feedbackTags: parseFeedbackTags(feedbackTagsText),
      jobId: selectedJob.id,
      nextAction: getDefaultFeedbackNextAction(outcome),
      notes: notes.trim() || getDefaultFeedbackNotes(outcome, selectedJob.title),
      outcome,
      resumeVersionId: selectedResumeVersion.id,
    });
    const syncResult = syncEntry(selectedJob, pipelineStatus, record.next_action);

    showToast({
      message: syncResult === "added" ? "已新增管线卡片并同步状态" : "已同步求职管线状态",
      title: "反馈已记录",
    });
  };

  return (
    <Card surface="subtle" className="p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="cyan">反馈录入</Badge>
            <Badge tone={feedbackOutcomeTone[outcome]}>{feedbackOutcomeLabel[outcome]}</Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            记录岗位结果后会自动同步求职管线状态，P1-G 阶段先支持手动录入和管线联动。
          </p>
        </div>
        <Badge tone="blue">同步到：{pipelineStatusLabel[pipelineStatus]}</Badge>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <label>
          <div className="mb-2 text-xs text-slate-500">岗位</div>
          <Select value={jobId} onChange={(event) => setJobId(event.target.value)}>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} / {job.company}
              </option>
            ))}
          </Select>
        </label>

        <label>
          <div className="mb-2 text-xs text-slate-500">结果</div>
          <Select value={outcome} onChange={(event) => setOutcome(event.target.value as ApplicationFeedbackOutcome)}>
            {feedbackOutcomeOptions.map((item) => (
              <option key={item} value={item}>
                {feedbackOutcomeLabel[item]}
              </option>
            ))}
          </Select>
        </label>

        <label>
          <div className="mb-2 text-xs text-slate-500">简历版本</div>
          <Select value={resumeVersionId} onChange={(event) => setResumeVersionId(event.target.value)}>
            {resumeVersions.map((version) => (
              <option key={version.id} value={version.id}>
                {version.name}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <label>
          <div className="mb-2 text-xs text-slate-500">反馈原因标签，用顿号或逗号分隔</div>
          <Textarea
            value={feedbackTagsText}
            onChange={(event) => setFeedbackTagsText(event.target.value)}
            placeholder="例如：RAG 项目命中、Kubernetes 证据缺口"
          />
        </label>
        <label>
          <div className="mb-2 text-xs text-slate-500">备注</div>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="记录 HR/面试官反馈、无回复判断或被拒原因"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button onClick={handleSubmit}>记录反馈并同步管线</Button>
        {selectedJob ? (
          <Button asChild variant="secondary">
            <Link to={`/jobs/${selectedJob.id}`}>查看岗位决策卡</Link>
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
