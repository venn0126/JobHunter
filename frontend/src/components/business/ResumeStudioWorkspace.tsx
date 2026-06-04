import { useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Panel } from "@/components/ui/Panel";
import { useTimedNotice } from "@/hooks/useTimedNotice";
import { copyText } from "@/lib/clipboard";
import { getCareerVaultPath } from "@/services/careerVaultService";
import { getResumeLabPath } from "@/services/resumeLabService";
import {
  getAcceptedResumeSections,
  getResumeVersionName,
  getResumeStudioDraft,
  isResumeSectionAccepted,
  resolveResumeEvidence,
} from "@/services/resumeStudioService";
import { emptyResumeStudioJobState, useResumeStudioStore } from "@/stores/resumeStudioStore";
import type { CareerVaultItem, ResumeStudioSection } from "@/types/demo";
import { ResumeStudioPreview } from "./ResumeStudioPreview";
import { ResumeStudioSectionCard } from "./ResumeStudioSectionCard";

export function ResumeStudioWorkspace({
  jobId,
  vaultItems,
}: {
  jobId?: string;
  vaultItems: CareerVaultItem[];
}) {
  const { notice, showNotice } = useTimedNotice(2600);
  const draft = useMemo(() => getResumeStudioDraft(jobId), [jobId]);
  const jobDraftState = useResumeStudioStore(
    (state) => state.draftsByJobId[draft.job_id] ?? emptyResumeStudioJobState,
  );
  const { decisions, savedVersionName } = jobDraftState;
  const acceptSection = useResumeStudioStore((state) => state.acceptSection);
  const revokeSection = useResumeStudioStore((state) => state.revokeSection);
  const saveVersion = useResumeStudioStore((state) => state.saveVersion);
  const acceptedSections = useMemo(
    () => getAcceptedResumeSections(draft.sections, decisions),
    [decisions, draft.sections],
  );
  const defaultVersionName = useMemo(() => getResumeVersionName(draft), [draft]);

  const handleCopySection = useCallback(
    (section: ResumeStudioSection) => {
      void copyText(section.after);
      showNotice(`已复制：${section.section}`);
    },
    [showNotice],
  );

  const handleCopyAccepted = useCallback(() => {
    const content = acceptedSections.map((section) => section.after).join("\n\n");
    if (!content) {
      showNotice("请先接受至少一条修改。");
      return;
    }

    void copyText(content);
    showNotice("已复制当前版本草稿。");
  }, [acceptedSections, showNotice]);

  const handleSaveVersion = useCallback(() => {
    if (!acceptedSections.length) {
      showNotice("请先接受至少一条修改。");
      return;
    }

    saveVersion(draft.job_id, defaultVersionName);
    showNotice(`已保存为新版本：${defaultVersionName}`);
  }, [acceptedSections.length, defaultVersionName, draft.job_id, saveVersion, showNotice]);

  return (
    <>
      <Card as="section" surface="hero" className="p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge tone="cyan" className="mb-4">
              P1-01 简历工作室
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              用真实证据，把简历改成岗位定制版本。
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">
              展示修改前后 Diff、修改原因和证据引用；没有证据的内容只作为“建议补充”，避免 AI 编造。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSaveVersion}>保存为新版本</Button>
            <Button variant="secondary" onClick={handleCopyAccepted}>
              复制当前版本
            </Button>
            <Button asChild variant="secondary">
              <Link to={getResumeLabPath()}>查看版本实验</Link>
            </Button>
          </div>
        </div>
      </Card>

      {notice ? (
        <Card surface="accent" className="p-4 text-sm text-cyanGlow">
          {notice}
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <div className="text-sm text-slate-400">目标岗位</div>
          <div className="mt-3 text-2xl font-semibold">{draft.job_title}</div>
          <div className="mt-2 text-xs text-slate-500">{draft.company}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-slate-400">定制状态</div>
          <div className="mt-3 text-2xl font-semibold">{draft.summary.readiness}</div>
          <div className="mt-2 text-xs text-slate-500">区分可直接使用与建议补充</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-slate-400">证据覆盖</div>
          <div className="mt-3 text-2xl font-semibold">
            {draft.summary.ready_sections}/{draft.sections.length}
          </div>
          <div className="mt-2 text-xs text-slate-500">已引用职业素材库证据</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-slate-400">JD 关键词</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {draft.keywords.slice(0, 4).map((keyword) => (
              <Badge key={keyword} tone="blue" className="px-2 py-0.5 text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1.25fr_0.75fr]">
        <Panel title="修改前后对比">
          <div className="space-y-4">
            {draft.sections.map((section) => (
              <ResumeStudioSectionCard
                accepted={isResumeSectionAccepted(section, decisions)}
                evidenceLinks={resolveResumeEvidence(section, vaultItems)}
                key={section.id}
                section={section}
                toEvidencePath={(targetEvidenceId) => getCareerVaultPath(targetEvidenceId, { jobId: draft.job_id })}
                onAccept={() => acceptSection(draft.job_id, section.id)}
                onCopy={() => handleCopySection(section)}
                onRevoke={() => revokeSection(draft.job_id, section.id)}
              />
            ))}
          </div>
        </Panel>

        <Panel title="版本草稿">
          <ResumeStudioPreview
            defaultVersionName={defaultVersionName}
            sections={acceptedSections}
            versionName={savedVersionName}
          />
          <div className="mt-4 grid gap-3">
            <Button onClick={handleSaveVersion}>保存为新简历版本</Button>
            <Button variant="secondary" onClick={handleCopyAccepted}>
              复制已接受内容
            </Button>
            <Button asChild variant="secondary">
              <Link to={`/jobs/${draft.job_id}`}>回到岗位决策卡</Link>
            </Button>
          </div>
        </Panel>
      </section>
    </>
  );
}
