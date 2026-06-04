import { demoData } from "@/data/demoData";
import { getInterviewGuidePath } from "@/services/interviewGuideService";
import type { DemoJob, JobDecisionCard, RecruiterLens } from "@/types/demo";

export function getJobById(jobId: string) {
  return demoData.jobs.items.find((item) => item.id === jobId) ?? demoData.jobs.items[0];
}

export function getDecisionCard(job: DemoJob): JobDecisionCard {
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
          evidence_id: "ev_missing",
          fix_action: "补充职业素材库",
          level: "中",
          text: "决策数据使用 Mock 兜底，解释深度有限。",
          type: "数据不足",
        },
      ],
      next_actions: [
        { label: "加入求职管线", target_path: "/pipeline" },
        { label: "补充职业素材", target_path: "/resume" },
        { label: "准备面试作战卡", target_path: getInterviewGuidePath(job.id) },
      ],
    }
  );
}

export function getRecruiterLens(job: DemoJob): RecruiterLens {
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
