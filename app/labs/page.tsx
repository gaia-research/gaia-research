import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import bakeoff from "@/content/reports/context-diet-lab-001/bakeoff.json";

export const metadata: Metadata = {
  title: "Labs — Gaia Research",
  description:
    "Interactive Gaia Research labs. Each lab turns a benchmark into a tool you can run yourself, privacy-first and in the browser.",
};

interface LabCard {
  id: string;
  status: "live" | "staged";
  name: string;
  benchmark: string;
  blurb: string;
  href?: string;
  stat?: string;
}

const labs: LabCard[] = [
  {
    id: "context-diet",
    status: "live",
    name: "Context Diet",
    benchmark: "Lab 001 / Benchmark 001",
    blurb:
      "Paste a context file, measure it, and project a reduction band from four verified strategies — then export a GAIA-compatible SKILL.md. Runs entirely in your browser.",
    href: "/labs/context-diet",
    stat: `Winner: ${bakeoff.winner.reductionPct}% reduction · 100% faithful`,
  },
];

export default function LabsIndexPage() {
  return (
    <>
      <header className="site-header">
        <BrandMark />
        <nav aria-label="Primary navigation">
          <Link href="/">Research</Link>
          <Link href="/labs">Labs</Link>
        </nav>
        <Link className="header-github" href="/">
          ← Mission Control
        </Link>
      </header>
      <main className="lab-page">
        <section className="section-shell" aria-labelledby="labs-title">
          <p className="eyebrow">
            <span className="led" /> LABS / INTERACTIVE SURFACES
          </p>
          <h1 id="labs-title">Run the research yourself.</h1>
          <p>
            Every Gaia Research lab turns a benchmark into a tool you can run in your own browser.
            Nothing you paste is uploaded or stored — only anonymized metrics, and only if you opt
            in.
          </p>
          <div className="lab-index-grid">
            {labs.map((lab) => {
              const inner = (
                <>
                  <div className="lab-index-head">
                    <span className="section-kicker">{lab.benchmark}</span>
                    <span className={`status-chip status-${lab.status === "live" ? "act" : "prp"}`}>
                      {lab.status === "live" ? "LIVE" : "STAGED"}
                    </span>
                  </div>
                  <h2>{lab.name}</h2>
                  <p>{lab.blurb}</p>
                  {lab.stat && <small>{lab.stat}</small>}
                </>
              );
              return lab.href ? (
                <Link key={lab.id} href={lab.href} className="lab-index-card">
                  {inner}
                </Link>
              ) : (
                <article key={lab.id} className="lab-index-card is-staged">
                  {inner}
                </article>
              );
            })}
          </div>
        </section>
      </main>
      <footer>
        <BrandMark />
        <p>The lab discovers. The registry remembers.</p>
      </footer>
    </>
  );
}
