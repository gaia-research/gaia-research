// Static Lab 001 evidence, rendered as in-brand data-viz rather than bare
// tables. All numbers come from the recorded run JSON — nothing is computed at
// request time beyond layout ratios. Server component (no client state).

import baseline from "@/content/reports/context-diet-lab-001/baseline.json";
import after from "@/content/reports/context-diet-lab-001/after.json";
import bakeoff from "@/content/reports/context-diet-lab-001/bakeoff.json";

const num = (n: number) => n.toLocaleString("en-US");

// Diet bar scales to the baseline (the largest value), so the baseline fills
// the track and everything else reads as a fraction of "before".
const DIET_MAX = baseline.totalChars;
const pct = (n: number) => `${((n / DIET_MAX) * 100).toFixed(1)}%`;

// Bake-off bars scale to a round ceiling above the winner so the winner never
// pins to 100% (which would read as "maxed out" rather than "best of four").
const BAKEOFF_MAX = 50;
const reductionSaved = baseline.totalChars - after.totalChars;
const reductionPct = ((reductionSaved / baseline.totalChars) * 100).toFixed(1);

export function ContextDietEvidence() {
  return (
    <>
      {/* ── Before / after: the diet itself ─────────────────────────────── */}
      <figure className="cd-chart cd-diet">
        <figcaption>
          <span className="section-kicker">BEFORE → AFTER · THIS REPO&apos;S CLAUDE.md</span>
          <p>
            The winning strategy cut <strong>{num(reductionSaved)} chars</strong> (
            {reductionPct}%) — from over the {num(baseline.limit)} limit to{" "}
            {num(after.headroom)} under it.
          </p>
        </figcaption>

        <div className="cd-diet-track" role="img" aria-label={`Baseline ${num(baseline.totalChars)} characters, over the ${num(baseline.limit)} limit; after the diet ${num(after.totalChars)} characters, ${num(after.headroom)} under the limit.`}>
          {/* limit marker */}
          <div className="cd-limit" style={{ left: pct(baseline.limit) }}>
            <span>LIMIT {num(baseline.limit)}</span>
          </div>

          <div className="cd-bar-row">
            <span className="cd-bar-label">BASELINE</span>
            <div className="cd-bar-track">
              <div className="cd-bar cd-bar-over" style={{ width: pct(baseline.totalChars) }}>
                <b>{num(baseline.totalChars)}</b>
                <span>chars · ~{num(baseline.approxTokens)} tok</span>
              </div>
            </div>
            <span className="cd-bar-tag cd-tag-over">
              +{num(baseline.overBy)} over
            </span>
          </div>

          <div className="cd-bar-row">
            <span className="cd-bar-label">AFTER</span>
            <div className="cd-bar-track">
              <div className="cd-bar cd-bar-after" style={{ width: pct(after.totalChars) }}>
                <b>{num(after.totalChars)}</b>
                <span>chars · ~{num(after.approxTokens)} tok</span>
              </div>
            </div>
            <span className="cd-bar-tag cd-tag-under">
              {num(after.headroom)} headroom
            </span>
          </div>
        </div>
        <p className="cd-chart-foot">
          Sections {baseline.sectionCount} → {after.sectionCount}. Strategy: {bakeoff.winner.title},
          externalizing detail into {bakeoff.winner.newFileCount} linked files.
        </p>
      </figure>

      {/* ── Strategy bake-off ───────────────────────────────────────────── */}
      <figure className="cd-chart cd-bakeoff">
        <figcaption>
          <span className="section-kicker">STRATEGY BAKE-OFF · REDUCTION %</span>
          <p>
            Four reduction strategies, all verified <strong>100% faithful</strong> against the
            true 124-rule inventory. Ranked by how much they cut; the winner is the target the
            estimator projects toward.
          </p>
        </figcaption>

        <ul className="cd-bakeoff-list">
          {[...bakeoff.comparison]
            .sort((a, b) => b.reductionPct - a.reductionPct)
            .map((c) => {
              const win = c.key === bakeoff.winnerKey;
              return (
                <li key={c.key} className={win ? "cd-strat cd-strat-win" : "cd-strat"}>
                  <div className="cd-strat-head">
                    <span className="cd-strat-name">
                      {c.title}
                      {win && <span className="lb-badge"> ★ winner</span>}
                    </span>
                    <span className="cd-strat-pct">{c.reductionPct}%</span>
                  </div>
                  <div
                    className="cd-strat-track"
                    role="img"
                    aria-label={`${c.title}: ${c.reductionPct}% reduction, 100% faithful.`}
                  >
                    <div
                      className="cd-strat-bar"
                      style={{ width: `${(c.reductionPct / BAKEOFF_MAX) * 100}%` }}
                    />
                  </div>
                  <div className="cd-strat-meta">
                    <span>{num(c.charCount)} chars</span>
                    <span className="cd-strat-faith">✓ {c.faithfulness}% faithful</span>
                    {c.underTarget ? (
                      <span className="cd-strat-flag cd-flag-ok">under target</span>
                    ) : (
                      <span className="cd-strat-flag">under limit</span>
                    )}
                  </div>
                </li>
              );
            })}
        </ul>
      </figure>
    </>
  );
}
