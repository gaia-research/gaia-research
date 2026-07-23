import { useId } from "react";

export function InfoTip({ label, children }: { label: string; children: React.ReactNode }) {
  const id = useId();

  return (
    <span className="info-tip">
      <button type="button" className="info-tip-trigger" aria-label={label} aria-describedby={id}>
        ?
      </button>
      <span className="info-tip-content" id={id} role="tooltip">
        {children}
      </span>
    </span>
  );
}
