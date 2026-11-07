import katex from "katex";
import type { ReactNode } from "react";

// Visual, colour-coded renderings of the Orchestration Guide's cost maths.
// Every number here is copied from content/reports/orchestration-guide/guide.md;
// the original markdown stays one tap away under each figure.
//
// Colour key (shared with the cache-horizon timeline above):
//   blue  = 5-minute cache write      pink  = 1-hour cache write
//   green = warm cache read / success amber = synthetic heartbeat reads

function Tex({ tex, className }: { tex: string; className?: string }) {
  const html = katex.renderToString(tex, { throwOnError: false, output: "html" });
  return <span className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ── C_verified ─────────────────────────────────────────────────────────── */

const TERMS = [
  { tex: "\\mathbb{E}[C_{\\text{execution}}]", tone: "execution", label: "Worker inference" },
  { tex: "\\mathbb{E}[C_{\\text{orchestration}}]", tone: "orchestration", label: "Orchestrator tax" },
  { tex: "\\mathbb{E}[C_{\\text{verification}}]", tone: "verification", label: "Checking the work" },
] as const;

export function CostEquation() {
  return (
    <figure
      className="gmf-eq"
      aria-label="C verified equals the expected execution cost plus the expected orchestration cost plus the expected verification cost, all divided by the probability that the result is verified."
    >
      <div className="gmf-eq-lhs">
        <Tex tex="C_{\text{verified}}" />
        <span className="gmf-eq-equals" aria-hidden="true">=</span>
      </div>
      <div className="gmf-eq-frac">
        <div className="gmf-eq-num">
          {TERMS.map((t, i) => (
            <span key={t.tone} className="gmf-eq-termwrap">
              {i > 0 && (
                <span className="gmf-eq-plus" aria-hidden="true">
                  +
                </span>
              )}
              <span className="gmf-eq-term" data-tone={t.tone}>
                <Tex tex={t.tex} />
                <small>{t.label}</small>
              </span>
            </span>
          ))}
        </div>
        <div className="gmf-eq-bar" aria-hidden="true" />
        <div className="gmf-eq-den">
          <span className="gmf-eq-term" data-tone="pass">
            <Tex tex="P(\text{verified})" />
            <small>Chance it passes</small>
          </span>
        </div>
      </div>
      <figcaption className="gmf-cap">
        Price the verified outcome, not the token: anything that lowers the top or raises the bottom wins.
      </figcaption>
    </figure>
  );
}

/* ── Bars ───────────────────────────────────────────────────────────────── */

type Tone = "w5" | "w1h" | "read" | "beat";

interface Segment {
  value: number;
  tone: Tone;
  label: string;
}

function Bar({
  segments,
  max,
  total,
  unit,
  sum,
}: {
  segments: Segment[];
  max: number;
  total: string;
  unit?: ReactNode;
  sum?: ReactNode;
}) {
  return (
    <div className="gmf-bar-row">
      <div className="gmf-bar" aria-hidden="true">
        {segments.map((s, i) => (
          <span
            key={i}
            className="gmf-seg"
            data-tone={s.tone}
            style={{ width: `${(s.value / max) * 100}%` }}
            title={`${s.label}: ${s.value}`}
          />
        ))}
      </div>
      <p className="gmf-sum">
        {sum ??
          segments.map((s, i) => (
          <span key={i}>
            {i > 0 && <span className="gmf-op"> + </span>}
            <span className="gmf-num" data-tone={s.tone}>
              {s.value.toFixed(2)}
            </span>
          </span>
          ))}
        <span className="gmf-op"> = </span>
        <b className="gmf-total">{total}</b>
        {unit}
      </p>
    </div>
  );
}

function Legend({ items }: { items: { tone: Tone; label: string }[] }) {
  return (
    <ul className="gmf-legend" aria-label="Colour key">
      {items.map((it) => (
        <li key={it.label} data-tone={it.tone}>
          {it.label}
        </li>
      ))}
    </ul>
  );
}

/* ── 5m vs 1h comparison (replaces the break-even table visually) ───────── */

export function TtlCompare({ children }: { children: ReactNode }) {
  return (
    <figure className="gmf-fig" aria-labelledby="gmf-ttl-cap">
      <figcaption id="gmf-ttl-cap" className="gmf-fig-head">
        <span className="gmf-chip" data-tone="w5">Standard 5-minute TTL</span>
        <span className="gmf-vs">vs</span>
        <span className="gmf-chip" data-tone="w1h">
          Extended 1-hour TTL <code>ttl: &apos;1h&apos;</code>
        </span>
      </figcaption>

      <div className="gmf-metric">
        <h4>Initial cache write surcharge</h4>
        <div className="gmf-pair">
          <span className="gmf-pair-label" data-tone="w5">5m</span>
          <span className="gmf-pair-bar"><span data-tone="w5" style={{ width: `${(1.25 / 2) * 100}%` }} /></span>
          <b data-tone="w5">1.25×</b>
        </div>
        <div className="gmf-pair">
          <span className="gmf-pair-label" data-tone="w1h">1h</span>
          <span className="gmf-pair-bar"><span data-tone="w1h" style={{ width: "100%" }} /></span>
          <b data-tone="w1h">2.00×</b>
        </div>
        <p className="gmf-note">of base input tokens · the 1-hour write costs +60% over the 5-minute write</p>
      </div>

      <div className="gmf-metric">
        <h4>Subsequent cache read (hit)</h4>
        <div className="gmf-pair">
          <span className="gmf-pair-label" data-tone="read">both</span>
          <span className="gmf-pair-bar"><span data-tone="read" style={{ width: `${(0.1 / 2) * 100}%` }} /></span>
          <b data-tone="read">0.10× · 0.05×</b>
        </div>
        <p className="gmf-note">Same on both: Sonnet 5 <strong>0.10×</strong> · Opus 5.5 <strong>0.05×</strong>, drawn to the same scale as the writes above</p>
      </div>

      <div className="gmf-metric">
        <h4>Sliding retention window</h4>
        <div className="gmf-pair">
          <span className="gmf-pair-label" data-tone="w5">5m</span>
          <span className="gmf-pair-bar"><span data-tone="w5" style={{ width: `${(5 / 60) * 100}%` }} /></span>
          <b data-tone="w5">5 min</b>
        </div>
        <div className="gmf-pair">
          <span className="gmf-pair-label" data-tone="w1h">1h</span>
          <span className="gmf-pair-bar"><span data-tone="w1h" style={{ width: "100%" }} /></span>
          <b data-tone="w1h">60 min</b>
        </div>
        <p className="gmf-note">measured from the last hit</p>
      </div>

      <details className="gmf-source">
        <summary>Show as a table</summary>
        {children}
      </details>
    </figure>
  );
}

/* ── Case 1 / Case 2 ────────────────────────────────────────────────────── */

const PL = <Tex className="gmf-pl" tex="\times P_{\text{in}}L" />;

export function TtlCases({ children }: { children: ReactNode }) {
  return (
    <figure className="gmf-fig gmf-cases" aria-label="Break-even cases, 5-minute versus 1-hour cache">
      <div className="gmf-case">
        <h4>
          <span>Case 1</span> A single pause over 5 minutes (2 turns)
        </h4>
        <p className="gmf-row-label">
          <span data-tone="w5">5-minute TTL</span> expires during an 8-minute worker run: two cold writes
        </p>
        <Bar
          max={2.5}
          total="2.50"
          unit={PL}
          segments={[
            { value: 1.25, tone: "w5", label: "5m write" },
            { value: 1.25, tone: "w5", label: "5m cold re-write" },
          ]}
        />
        <p className="gmf-row-label">
          <span data-tone="w1h">1-hour TTL</span> stays warm: one 1h write + one warm hit
        </p>
        <Bar
          max={2.5}
          total="2.10"
          unit={PL}
          segments={[
            { value: 2.0, tone: "w1h", label: "1h write" },
            { value: 0.1, tone: "read", label: "warm hit" },
          ]}
        />
        <p className="gmf-result">
          <span>Avoiding a single cold eviction saves</span>
          <b>16.0%</b>
          <span className="gmf-result-math">
            on turn 2 (<span data-tone="w5">2.50</span> − <span data-tone="w1h">2.10</span>) ÷{" "}
            <span data-tone="w5">2.50</span> = 0.160
          </span>
        </p>
      </div>

      <div className="gmf-case">
        <h4>
          <span>Case 2</span> 8-turn swarm across seven 7.5-minute gaps (52.5m total)
        </h4>
        <p className="gmf-row-label">
          <span data-tone="w5">5-minute TTL</span>, every wakeup misses: 8 × (1.25 × 2.00 × 0.1)
        </p>
        <Bar
          max={2}
          total="$2.00"
          sum={
            <>
              8 × <span className="gmf-num" data-tone="w5">0.25</span>
            </>
          }
          segments={Array.from({ length: 8 }, () => ({ value: 0.25, tone: "w5" as Tone, label: "cold 5m write" }))}
        />
        <p className="gmf-row-label">
          <span data-tone="w5">5-minute TTL</span> + <span data-tone="beat">270s synthetic heartbeats</span> (21 pings
          across seven 15m gaps)
        </p>
        <Bar
          max={2}
          total="$0.81"
          unit={<span className="gmf-aside"> plus extra failure surface</span>}
          segments={[
            { value: 0.25, tone: "w5", label: "one 5m write" },
            { value: 0.42, tone: "beat", label: "21 heartbeat reads" },
            { value: 0.14, tone: "read", label: "7 warm wakeups" },
          ]}
        />
        <p className="gmf-row-label">
          <span data-tone="w1h">Native 1-hour TTL</span>: (2.00 × 2.00 × 0.1) + 7 × (0.10 × 2.00 × 0.1)
        </p>
        <Bar
          max={2}
          total="$0.54"
          segments={[
            { value: 0.4, tone: "w1h", label: "one 1h write" },
            { value: 0.14, tone: "read", label: "7 warm hits" },
          ]}
        />
        <p className="gmf-result">
          <span>Native 1-hour TTL spends</span>
          <b>73% less</b>
          <span className="gmf-result-math">
            prefill than cold 5m writes, and a third less than synthetic heartbeats. On Opus 5.5: $0.94 native 1h vs.
            $1.06 with pings.
          </span>
        </p>
      </div>

      <Legend
        items={[
          { tone: "w5", label: "5-minute cache write (1.25×)" },
          { tone: "w1h", label: "1-hour cache write (2.00×)" },
          { tone: "read", label: "Warm cache read (0.10×)" },
          { tone: "beat", label: "Heartbeat reads" },
        ]}
      />
      <p className="gmf-basis">
        Claude Sonnet 5, <Tex tex="P_{\text{in}} = 2.00" /> USD/M, <Tex tex="L = 0.1\text{M}" /> tokens. Bars within a
        case share one scale.
      </p>

      <details className="gmf-source">
        <summary>Show the derivation as text</summary>
        {children}
      </details>
    </figure>
  );
}
