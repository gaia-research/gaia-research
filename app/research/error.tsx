"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ResearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Research route failed", error);
  }, [error]);

  return (
    <main className="research-error" aria-labelledby="research-error-title">
      <p className="signal"><span /> RESEARCH SYSTEM NOTICE</p>
      <h1 id="research-error-title">This report is regrouping.</h1>
      <p>
        The publication could not load just now. Its source remains public; try again or return to
        the Research index.
      </p>
      <div className="actions">
        <button className="button primary" type="button" onClick={reset}>Try again <span>→</span></button>
        <Link className="button secondary" href="/research">Research index <span>→</span></Link>
      </div>
    </main>
  );
}
