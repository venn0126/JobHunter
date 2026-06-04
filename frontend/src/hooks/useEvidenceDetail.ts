import { useCallback, useMemo, useState } from "react";
import type { CareerVaultItem } from "@/types/demo";

export function useEvidenceDetail(vaultItems: CareerVaultItem[]) {
  const [activeEvidenceId, setActiveEvidenceId] = useState("");
  const activeEvidenceItem = useMemo(
    () => vaultItems.find((item) => item.id === activeEvidenceId),
    [activeEvidenceId, vaultItems],
  );

  const openEvidence = useCallback((evidenceId?: string | null) => {
    setActiveEvidenceId(evidenceId ?? "");
  }, []);

  const closeEvidence = useCallback(() => {
    setActiveEvidenceId("");
  }, []);

  return {
    activeEvidenceId,
    activeEvidenceItem,
    closeEvidence,
    isEvidenceOpen: Boolean(activeEvidenceId),
    openEvidence,
  };
}
