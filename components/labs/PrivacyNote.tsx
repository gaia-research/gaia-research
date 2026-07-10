// Static privacy note. Not "use client" — no interactivity; it renders on the
// server as part of the analyzer surface. Wording satisfies Issue #16 task 5.

export function PrivacyNote() {
  return (
    <p className="privacy-note" role="note">
      <strong>Private by design.</strong> Analysis runs entirely in your browser. Pasted text is
      never uploaded, logged, or stored. Only anonymized metrics (token counts and reduction %) are
      sent — and only if you opt in below.
    </p>
  );
}
