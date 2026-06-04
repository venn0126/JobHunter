import type { AddPipelineResult, MovePipelineResult } from "@/stores/pipelineStore";
import { pipelineStatusLabel } from "@/stores/pipelineStore";
import type { PipelineStatus } from "@/types/common";
import type { DemoJob } from "@/types/demo";
import type { ToastInput } from "@/stores/toastStore";

export function getPipelineAddToast(job: DemoJob, result: AddPipelineResult): ToastInput {
  return result === "added"
    ? { message: job.title, title: "已加入求职管线" }
    : { message: job.title, title: "岗位已在管线中", tone: "info" };
}

export function getPipelineMoveToast(result: MovePipelineResult, status: PipelineStatus): ToastInput {
  if (result === "moved") {
    return { message: pipelineStatusLabel[status], title: "已更新管线状态" };
  }
  if (result === "invalid") {
    return { title: "非法状态流转已拦截", tone: "warning" };
  }
  return { title: "未找到对应管线岗位", tone: "danger" };
}
