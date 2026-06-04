import { Drawer } from "@/components/ui/Drawer";
import { EvidenceDetailCard } from "@/components/business/EvidenceDetailCard";
import type { CareerVaultItem } from "@/types/demo";

export function EvidenceDetailDrawer({
  evidenceId,
  item,
  jobId,
  onClose,
  open,
}: {
  evidenceId?: string;
  item?: CareerVaultItem;
  jobId?: string;
  onClose: () => void;
  open: boolean;
}) {
  return (
    <Drawer open={open} title="证据引用详情" onClose={onClose}>
      <EvidenceDetailCard evidenceId={evidenceId} item={item} jobId={jobId} />
    </Drawer>
  );
}
