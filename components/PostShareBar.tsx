"use client";

import { useCallback, useRef, useState } from "react";

/**
 * PostShareBar — fixed, top-right, icon-only share/copy control for blog posts.
 *
 * Rendered once per post. `position: fixed` (see `.post-share` in
 * `app/globals.css`) pins it to the top-right of the viewport, offset below the
 * site header (`.site-header`, 72px desktop / 62px mobile) and behind it in the
 * stacking order (z-index 4 < the header's 5) so the primary nav always wins and
 * the bar never covers the brand or mobile menu toggle.
 *
 * Client-only affordance: uses the Web Share API when the browser exposes it
 * (mostly mobile), and always offers an explicit copy-link that writes the
 * canonical page URL to the clipboard. Every browser API is touched inside an
 * event handler only, so the component prerenders cleanly for static export.
 *
 * Order is Copy then Share. Icons only — no text labels — so the controls stay
 * square with no layout shift. The copied confirmation swaps the chain icon for
 * a checkmark (same box, no size change) and is announced via an `sr-only`
 * `role="status"` live region.
 */

function LinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.5 14.5l5-5" />
      <path d="M11.5 6.5l1.2-1.2a3.6 3.6 0 0 1 5.1 5.1L17.6 11.7" />
      <path d="M12.5 17.5l-1.2 1.2a3.6 3.6 0 0 1-5.1-5.1L6.4 12.3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.5 12.5l4.5 4.5 10.5-11" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
      <line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
    </svg>
  );
}

export default function PostShareBar({ title }: { title?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback(() => {
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  }, []);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      flash();
    } catch {
      /* clipboard blocked (insecure context / denied) — leave no dead-end error */
    }
  }, [flash]);

  const share = useCallback(async () => {
    const url = window.location.href;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: title ?? document.title, url });
        return;
      } catch {
        /* user dismissed the share sheet, or it failed — fall back to copy */
      }
    }
    void copyLink();
  }, [title, copyLink]);

  return (
    <div className="post-share" aria-label="Share this post">
      <button
        type="button"
        onClick={copyLink}
        className="post-share-btn"
        data-copied={copied}
        aria-label={copied ? "Link copied to clipboard" : "Copy link to this post"}
      >
        {copied ? <CheckIcon /> : <LinkIcon />}
      </button>
      <button
        type="button"
        onClick={share}
        className="post-share-btn"
        aria-label="Share this post"
      >
        <ShareIcon />
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </div>
  );
}
