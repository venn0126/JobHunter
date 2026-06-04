import { useState } from "react";
import { getPipelineEntryByJobId, type PipelineEntry } from "@/stores/pipelineStore";
import type { PipelineStatus } from "@/types/common";

export function usePipelineDrag({
  entries,
  onMove,
}: {
  entries: PipelineEntry[];
  onMove: (jobId: string, status: PipelineStatus) => void;
}) {
  const [draggedJobId, setDraggedJobId] = useState("");
  const [dragOverStatus, setDragOverStatus] = useState<PipelineStatus | undefined>(undefined);

  const clearDrag = () => {
    setDraggedJobId("");
    setDragOverStatus(undefined);
  };

  const clearDragOver = () => {
    setDragOverStatus(undefined);
  };

  const handleDrop = (status: PipelineStatus) => {
    if (!draggedJobId) {
      return;
    }
    const draggedEntry = getPipelineEntryByJobId(entries, draggedJobId);
    if (draggedEntry?.status !== status) {
      onMove(draggedJobId, status);
    }
    clearDrag();
  };

  return {
    clearDrag,
    clearDragOver,
    dragOverStatus,
    draggedJobId,
    handleDrop,
    setDragOverStatus,
    startDrag: setDraggedJobId,
  };
}
