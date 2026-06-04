import { demoData } from "@/data/demoData";
import type { CareerVaultItem, InterviewGuide, InterviewGuideQuestion } from "@/types/demo";

export function getInterviewGuide(jobId?: string): InterviewGuide {
  return (
    demoData.interviewGuide.items.find((item) => item.job_id === jobId) ??
    demoData.interviewGuide.items[0] ??
    createFallbackInterviewGuide(jobId)
  );
}

export function getInterviewGuidePath(jobId?: string) {
  return jobId ? `/interview?job=${encodeURIComponent(jobId)}` : "/interview";
}

export function getInterviewQuestionEvidence(question: InterviewGuideQuestion, vaultItems: CareerVaultItem[]) {
  return question.evidence_ids.map((evidenceId) => ({
    evidenceId,
    item: vaultItems.find((vaultItem) => vaultItem.id === evidenceId),
  }));
}

export function getMissingInterviewEvidenceId(
  evidenceLinks: Array<{
    evidenceId: string;
    item?: CareerVaultItem;
  }>,
) {
  return evidenceLinks.find(({ item }) => !item)?.evidenceId;
}

export function formatInterviewQuestionCopy(question: InterviewGuideQuestion) {
  return [
    `问题：${question.question}`,
    `面试官意图：${question.intent}`,
    "回答框架：",
    ...question.framework.map((item, index) => `${index + 1}. ${item}`),
    `风险提醒：${question.risk_tip}`,
  ].join("\n");
}

function createFallbackInterviewGuide(jobId = "job_unknown"): InterviewGuide {
  return {
    company_brief: {
      business: "暂无公司简报，后续由岗位详情和企业信息接口补齐。",
      interview_style: "先使用通用项目深挖模板准备面试。",
      role_focus: "重点准备岗位关键词、项目证据和风险缺口。",
    },
    interview_focus: ["梳理岗位关键词", "准备项目证据", "复盘简历风险"],
    job_id: jobId,
    questions: [],
    reverse_questions: ["这个岗位前三个月最重要的交付目标是什么？"],
    seven_day_plan: [],
  };
}
