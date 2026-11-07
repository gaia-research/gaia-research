import Link from "next/link";

// The guide's answer, drawn before it is argued: five rungs, each adding a
// coordination layer, and the instruction to stop at the lowest one that
// reliably passes. Names match content/reports/orchestration-guide/guide.md.
const RUNGS = [
  { level: "A", name: "No orchestration", note: "Default · one agent loop" },
  { level: "B", name: "Lightweight orchestration", note: "2–4 bounded subagents" },
  { level: "C", name: "Existing workflow infrastructure", note: "Durable retries, checkpoints" },
  { level: "D", name: "Thin economic scheduling", note: "Optional · recurring volume only" },
  { level: "E", name: "Human-controlled execution", note: "Irreversible or unverifiable work" },
] as const;

export default function GuideHeroLadder() {
  return (
    <figure className="ghl" aria-labelledby="ghl-cap">
      <ol className="ghl-rungs">
        {RUNGS.map((r, i) => (
          <li key={r.level} className="ghl-rung" data-level={r.level} style={{ ["--i" as string]: i }}>
            <Link href="#the-coordination-decision-framework" className="ghl-link">
              <b className="ghl-level">{r.level}</b>
              <span className="ghl-bar" aria-hidden="true" />
              <span className="ghl-text">
                <span className="ghl-name">{r.name}</span>
                <small>{r.note}</small>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <figcaption id="ghl-cap" className="ghl-cap">
        <strong>Start at A.</strong> Each rung adds a coordination layer; stop at the lowest one that reliably passes.
        E hands the wheel to a human.
      </figcaption>
    </figure>
  );
}
