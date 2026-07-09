import type { LedgerStatus } from "@/lib/data/research";

const labels: Record<LedgerStatus, string> = {
  PRP: "Proposed",
  ACT: "Active",
  REV: "In review",
  VRF: "Verified",
};

export function StatusChip({ status }: { status: LedgerStatus }) {
  return (
    <span
      className={`status-chip status-${status.toLowerCase()}`}
      title={labels[status]}
    >
      {status}
    </span>
  );
}
