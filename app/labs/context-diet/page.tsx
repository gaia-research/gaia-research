import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export const metadata: Metadata = {
  title: "Context Diet — Lab 001",
  description:
    "A staged Gaia Research lab for measuring prompt compression without losing the evidence.",
};

const metrics = [
  ["Token reduction", "Target", "Fewer tokens, explicit delta."],
  ["Faithfulness retained", "Guardrail", "Meaning checked against the source."],
  ["Latency saved", "Runtime", "Measure the response-time change."],
  ["Cost saved", "Budget", "Estimate input-token savings."],
  ["Export validity", "Protocol", "Validate the generated SKILL.md."],
];

export default function ContextDietPage() {
  return (
    <>
      <a className="skip-link" href="#lab-main">Skip to lab content</a>
      <header className="site-header">
        <BrandMark />
        <nav aria-label="Primary navigation">
          <Link href="/">Research</Link>
          <a href="#analyzer">Analyzer</a>
          <a href="#metrics">Metrics</a>
        </nav>
        <Link className="header-github" href="/">
          ← Mission Control
        </Link>
      </header>
      <main className="lab-page" id="lab-main">
        <section className="lab-hero" aria-labelledby="lab-title">
          <div>
            <p className="eyebrow">
              <span className="led" /> WIP LAB 001 / BENCHMARK 001
            </p>
            <h1 id="lab-title">Context Diet</h1>
            <p>
              Compression with receipts. A staged prompt-analysis lab for
              reducing context while preserving the instructions that matter.
            </p>
            <div className="lab-tags">
              <span>WIP / STATIC PROTOTYPE</span>
              <span>SKILL.md READY</span>
            </div>
          </div>
          <picture className="lab-hero-art">
            <source media="(max-width: 640px)" srcSet="/images/context-diet/context-diet-hero-3-4.avif" type="image/avif" />
            <source media="(max-width: 1000px)" srcSet="/images/context-diet/context-diet-hero-4-3.avif" type="image/avif" />
            <source media="(max-width: 640px)" srcSet="/images/context-diet/context-diet-hero-3-4.webp" type="image/webp" />
            <source media="(max-width: 1000px)" srcSet="/images/context-diet/context-diet-hero-4-3.webp" type="image/webp" />
            <source srcSet="/images/context-diet/context-diet-hero-16-9.avif" type="image/avif" />
            <img src="/images/context-diet/context-diet-hero-16-9.webp" alt="Context Diet laboratory illustration" fetchPriority="high" />
          </picture>
        </section>
        <section
          className="analyzer section-shell"
          id="analyzer"
          aria-labelledby="analyzer-title"
        >
          <div>
            <p className="section-kicker">PROMPT ANALYZER / CONCEPT</p>
            <h2 id="analyzer-title">See the context before you cut it.</h2>
            <p>
              Context Diet will separate signal from repetition, expose the
              proposed reduction, and retain an audit trail before any export is
              made.
            </p>
            <div className="analyzer-console">
              <header>
                <span className="led" /> ANALYZER OFFLINE / DEMO SURFACE
              </header>
              <div>
                <article>
                  <small>INPUT CONTEXT</small>
                  <p>
                    System constraints · tool policies · task detail · repeated
                    examples · historical turns
                  </p>
                  <b>12,480 tokens</b>
                </article>
                <span className="compression-arrow" aria-hidden="true">
                  ⇢
                </span>
                <article>
                  <small>PROPOSED DIET</small>
                  <p>
                    Preserved constraints · normalized tools · compressed
                    examples · cited decisions
                  </p>
                  <b>4,990 tokens</b>
                </article>
              </div>
            </div>
          </div>
          <img src="/images/context-diet/context-diet-prompt-analyzer-support.webp" alt="" className="analyzer-support" loading="lazy" />
        </section>
        <section
          className="metric-section section-shell"
          id="metrics"
          aria-labelledby="metrics-title"
        >
          <div className="section-kicker">BENCHMARK SIGNALS</div>
          <h2 id="metrics-title">What Benchmark 001 will report</h2>
          <div className="metrics-grid">
            {metrics.map(([name, type, copy], index) => (
              <article key={name}>
                <span>
                  MET-0{index + 1} / {type}
                </span>
                <h3>{name}</h3>
                <p>{copy}</p>
                <i aria-hidden="true" />
              </article>
            ))}
          </div>
        </section>
        <section
          className="compression section-shell"
          aria-labelledby="compression-title"
        >
          <img src="/images/context-diet/context-diet-token-compression-motif.webp" alt="" loading="lazy" />
          <div>
            <p className="section-kicker">COMPRESSION MOTIF</p>
            <h2 id="compression-title">Reduce the window. Keep the warrant.</h2>
            <p>
              The objective is not shorter prompts at any cost. It is a smaller,
              verifiable context package that still explains its operating
              constraints.
            </p>
          </div>
        </section>
        <section
          className="export-section section-shell"
          aria-labelledby="export-title"
        >
          <div>
            <p className="section-kicker">SKILL.md EXPORT</p>
            <h2 id="export-title">From analysis to an inspectable skill.</h2>
            <p>
              Once an analyst approves a diet, Context Diet will package the
              retained instructions, assumptions, benchmark notes, and
              provenance into a GAIA-compatible <code>SKILL.md</code> export.
              The export remains a proposal until its evidence is reviewed.
            </p>
            <a
              className="button button-secondary"
              href="https://github.com/gaia-research/gaia-research/tree/main/templates/skill-repo"
            >
              Inspect the skill template ↗
            </a>
          </div>
          <pre aria-label="Example SKILL.md export">
            <code>{`# Context Diet export\n\n## Retained constraints\n- Preserve task intent\n- Cite benchmark evidence\n\n## Provenance\nstatus: proposed`}</code>
          </pre>
        </section>
        <section
          className="lab-states section-shell"
          aria-labelledby="states-title"
        >
          <div>
            <p className="section-kicker">SUPPORT STATES</p>
            <h2 id="states-title">Built for the moments between results.</h2>
          </div>
          <div>
            {[
              ["/images/context-diet/context-diet-empty-state.webp", "Empty", "No prompt loaded yet."],
              ["/images/context-diet/context-diet-loading-state.webp", "Analyzing", "Evidence pass in progress."],
              ["/images/context-diet/context-diet-error-state.webp", "Blocked", "Export needs another pass."],
            ].map(([image, title, copy]) => (
              <article key={title}>
                <img src={image} alt="" loading="lazy" />
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer>
        <BrandMark />
        <p>Context Diet / Lab 001 is a transparent work in progress.</p>
      </footer>
    </>
  );
}
