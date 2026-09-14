"use client";

import { useCallback, useRef, useState } from "react";

// "Copy page" affordance for long-form guides: puts the page's own Markdown
// source on the clipboard so a reader can paste it straight into an agent and
// have it build a skill from the guide.
//
// Server-safe: without JS the button is inert but the page still reads, and the
// `fallbackHref` link to the raw source is a plain anchor that always works.
export default function CopyPage({
  markdown,
  label = "Copy page as Markdown",
  copiedLabel = "Copied — paste it into your agent",
  hint,
}: {
  markdown: string;
  label?: string;
  copiedLabel?: string;
  hint?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async () => {
    const reset = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setCopied(false);
        setFailed(false);
      }, 2600);
    };
    try {
      // Chrome leaves clipboard.writeText pending forever on a backgrounded
      // document, so a bare await can leave the button showing neither success
      // nor failure. Race it so the reader always gets an answer.
      const timedOut = Symbol("timeout");
      const result = await Promise.race([
        navigator.clipboard.writeText(markdown).then(() => "ok" as const),
        new Promise<typeof timedOut>((resolve) =>
          setTimeout(() => resolve(timedOut), 2000),
        ),
      ]);
      if (result === timedOut) throw new Error("clipboard write did not settle");
      setFailed(false);
      setCopied(true);
      reset();
    } catch {
      // Clipboard blocked (insecure context / permission denied / hidden tab).
      // Say so rather than silently doing nothing — the reader can still
      // select the page by hand.
      setCopied(false);
      setFailed(true);
      reset();
    }
  }, [markdown]);

  return (
    <div className="copy-page">
      <button
        type="button"
        className="copy-page-btn"
        onClick={copy}
        data-copied={copied}
        aria-label={label}
      >
        <span aria-hidden="true">
          {copied ? `✓ ${copiedLabel}` : failed ? "Copy blocked — select the page instead" : `⧉ ${label}`}
        </span>
      </button>
      {hint ? <p className="copy-page-hint">{hint}</p> : null}
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Page Markdown copied to clipboard" : failed ? "Clipboard unavailable" : ""}
      </span>
    </div>
  );
}
