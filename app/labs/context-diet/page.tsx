import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import contextHero from "@/assets/generated/exports/context-diet/context-diet-hero-16-9.webp";
import compressionMotif from "@/assets/generated/context-diet-token-compression-motif.webp";
import emptyState from "@/assets/generated/context-diet-empty-state.webp";
import loadingState from "@/assets/generated/context-diet-loading-state.webp";
import errorState from "@/assets/generated/context-diet-error-state.webp";
import { BrandMark } from "@/components/BrandMark";
import { ContextDietAnalyzer } from "@/components/labs/ContextDietAnalyzer";
import baseline from "@/content/reports/context-diet-lab-001/baseline.json";
import after from "@/content/reports/context-diet-lab-001/after.json";
import bakeoff from "@/content/reports/context-diet-lab-001/bakeoff.json";

export const metadata: Metadata = {
  title: "Context Diet — Lab 001",
  description:
    "A privacy-first Gaia Research lab for measuring prompt compression without losing the evidence. Analysis runs entirely in your browser.",
};

const num = (n: number) => n.toLocaleString("en-US");

// Lab 001 strategies, weakest → strongest, straight from the merged report.
const strategies = [...bakeoff.comparison].sort((a, b) => a.reductionPct - b.reductionPct);

export default function ContextDietPage() {
  return (
    <>
      <header className="site-header">
        <BrandMark />
        <nav aria-label="Primary navigation">
          <Link href="/">Research</Link>
          <a href="#analyzer">Analyzer</a>
          <a href="#evidence">Evidence</a>
        </nav>
        <Link className="header-github" href="/">
          ← Mission Control
        </Link>
      </header>
      <main className="lab-page">
        <section className="lab-hero" aria-labelledby="lab-title">
          <div>
            <p className="eyebrow">
              <span className="led" /> LAB 001 / BENCHMARK 001 · LIVE
            </p>
            <h1 id="lab-title">Context Diet</h1>
            <p>
              Compression with receipts. A privacy-first prompt-analysis lab for
              reducing context while preserving the instructions that matter —
              running entirely in your browser.
            </p>
            <div className="lab-tags">
              <span>LIVE / IN-BROWSER</span>
              <span>SKILL.md EXPORT</span>
            </div>
          </div>
          <Image
            src={contextHero}
            alt="Decorative Context Diet laboratory illustration"
            priority
            sizes="(max-width: 760px) 100vw, 50vw"
          />
        </section>
        <section
          className="analyzer-section section-shell"
          id="analyzer"
          aria-labelledby="analyzer-title"
        >
          <div>
            <p className="section-kicker">PROMPT ANALYZER / LIVE</p>
            <h2 id="analyzer-title">See the context before you cut it.</h2>
            <p>
              Paste a context file below. The analyzer measures it, separates
              signal from repetition, projects a reduction band from Lab 001&apos;s
              four strategies, and hands you a downloadable <code>SKILL.md</code> —
              all without your text ever leaving this page.
            </p>
          </div>
          <ContextDietAnalyzer />
        </section>
        <section
          className="metric-section section-shell"
          id="evidence"
          aria-labelledby="evidence-title"
        >
          <div className="section-kicker">LAB 001 EVIDENCE · MERGED REPORT</div>
          <h2 id="evidence-title">What Benchmark 001 actually reported</h2>
          <p>
            Real numbers from the merged Lab 001 run on a {num(baseline.totalChars)}-char{" "}
            <code>CLAUDE.md</code> ({num(baseline.approxTokens)} tokens, {baseline.overBy} over the{" "}
            {num(baseline.limit)} limit). All four strategies stayed 100% faithful against the
            corrected 124-rule inventory; the winner is the deepest cut.
          </p>
          <div className="analyzer-console" aria-label="Lab 001 measured result">
            <header>
              <span className="led" /> WINNER · {bakeoff.winner.title.toUpperCase()} ·{" "}
              {bakeoff.winner.reductionPct}% REDUCTION
            </header>
            <div>
              <article>
                <small>BEFORE</small>
                <p>
                  {num(baseline.totalChars)} chars · {baseline.sectionCount} sections · over by{" "}
                  {num(baseline.overBy)}
                </p>
                <b>{num(baseline.approxTokens)} tokens</b>
              </article>
              <span className="compression-arrow" aria-hidden="true">
                ⇢
              </span>
              <article>
                <small>AFTER · {bakeoff.winner.newFileCount} FILES EXTRACTED</small>
                <p>
                  {num(after.totalChars)} chars · {after.sectionCount} sections ·{" "}
                  {num(after.headroom)} headroom
                </p>
                <b>{num(after.approxTokens)} tokens</b>
              </article>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Strategy</th>
                  <th scope="col">Chars after</th>
                  <th scope="col">Reduction</th>
                  <th scope="col">Faithfulness</th>
                  <th scope="col">New files</th>
                </tr>
              </thead>
              <tbody>
                {strategies.map((s) => (
                  <tr key={s.key} className={s.key === bakeoff.winnerKey ? "lb-beat" : undefined}>
                    <th scope="row">
                      {s.title}
                      {s.key === bakeoff.winnerKey && <span className="lb-badge"> ★ winner</span>}
                    </th>
                    <td>{num(s.charCount)}</td>
                    <td>{s.reductionPct}%</td>
                    <td>{s.faithfulness}%</td>
                    <td>{s.newFileCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="cd-note">
            Read the full write-up in{" "}
            <Link href="https://github.com/gaia-research/gaia-research/tree/main/content/reports/context-diet-lab-001">
              content/reports/context-diet-lab-001 ↗
            </Link>
            .
          </p>
        </section>
        <section
          className="compression section-shell"
          aria-labelledby="compression-title"
        >
          <Image
            src={compressionMotif}
            alt="Decorative token compression motif"
          />
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
              The <strong>Download SKILL.md</strong> button in the analyzer packages your measured
              numbers and the ranked compaction targets — section titles only, never your pasted
              text — into a GAIA-compatible <code>SKILL.md</code> skeleton. The export remains a
              proposal until its evidence is reviewed.
            </p>
            <a
              className="button button-secondary"
              href="https://github.com/gaia-research/gaia-research/tree/main/templates/skill-repo"
            >
              Inspect the skill template ↗
            </a>
          </div>
          <pre aria-label="Example SKILL.md export">
            <code>{`---\nname: context-diet\ndescription: Reduce context while preserving load-bearing rules.\nversion: 1.0.0\n---\n\n## When to use\nContext file over the token budget.\n\n## Reading the output\nMeasured tokens, projected band, ranked targets.`}</code>
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
              [emptyState, "Empty", "No prompt loaded yet."],
              [loadingState, "Analyzing", "Evidence pass in progress."],
              [errorState, "Blocked", "Export needs another pass."],
            ].map(([image, title, copy]) => (
              <article key={title as string}>
                <Image src={image as typeof emptyState} alt="" />
                <h3>{title as string}</h3>
                <p>{copy as string}</p>
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
