"use client";

import { useCallback, useRef, useState } from "react";

// A multi-line prompt a visitor pastes into their own assistant. Unlike
// CopyCommand this is prose, not a shell line, so there is no "$" prefix.
// Without JS the text stays selectable; the button only enhances.
export default function CopyPrompt({ label, text, id }: { label: string; text: string; id: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked: the text remains selectable.
    }
  }, [text]);

  return (
    <figure className="apb-prompt" data-copied={copied}>
      <figcaption id={`${id}-label`}>
        <span>{label}</span>
        <button type="button" onClick={copy} aria-describedby={`${id}-label`}>
          {copied ? "Copied ✓" : "Copy prompt"}
        </button>
      </figcaption>
      <pre tabIndex={0} aria-labelledby={`${id}-label`}>{text}</pre>
      <span className="sr-only" role="status" aria-live="polite">{copied ? "Prompt copied to clipboard" : ""}</span>
    </figure>
  );
}
