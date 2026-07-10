"use client";

import { useCallback, useRef, useState } from "react";

// Terminal-style install line with a copy affordance. Used on the home Skills
// cards and the research report footer so both share one presentation.
// Server-safe fallback: without JS the command text is still selectable; the
// button only enhances.
export default function CopyCommand({
  command,
  className,
}: {
  command: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked (insecure context / denied): leave the text for
      // manual selection rather than surfacing a dead-end error.
    }
  }, [command]);

  return (
    <div className={`copy-command${className ? ` ${className}` : ""}`} data-copied={copied}>
      <code className="copy-command-text">
        <span aria-hidden="true">$ </span>
        {command}
      </code>
      <button
        type="button"
        className="copy-command-btn"
        onClick={copy}
        aria-label={`Copy install command: ${command}`}
      >
        <span aria-hidden="true">{copied ? "Copied ✓" : "Copy"}</span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  );
}
