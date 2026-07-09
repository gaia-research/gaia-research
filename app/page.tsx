import Image from "next/image";
import Link from "next/link";
import chiefScout from "@/assets/generated/exports/chief-scout-hero/chief-scout-hero-desktop-16-9.webp";
import milimAvatar from "@/assets/brand/exports/milim-avatar/milim-avatar-128.webp";
import { BrandMark } from "@/components/BrandMark";
import { ProjectGateways } from "@/components/research/ProjectGateways";
import { ResearchLedgerTable } from "@/components/research/ResearchLedgerTable";
import { directives } from "@/lib/data/research";

const suites = [
  [
    "G-Bench",
    "Generalist suite",
    "Capability coverage across tools, planning, and execution.",
  ],
  [
    "Safety alignment",
    "Eval set",
    "Tests for refusal quality, constraints, and recovery.",
  ],
  [
    "Memory",
    "Architecture analysis",
    "What persists, what decays, and what stays attributable.",
  ],
  [
    "Protocol fusion",
    "Active research",
    "How compatible skills compose under explicit evidence.",
  ],
];

export default function HomePage() {
  return (
    <>
      <header className="site-header">
        <BrandMark />
        <nav aria-label="Primary navigation">
          <a href="#research">Research</a>
          <a href="#ledger">Ledger</a>
          <a href="#benchmarks">Benchmarks</a>
          <Link href="/labs/context-diet">Labs</Link>
        </nav>
        <a
          className="header-github"
          href="https://github.com/gaia-research/gaia-research"
        >
          GitHub ↗
        </a>
      </header>
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="led" /> MISSION CONTROL / OPEN RESEARCH
              COLLECTIVE
            </p>
            <h1 id="hero-title">Pushing the Limits of AI Agent Capabilities</h1>
            <p className="hero-description">
              Gaia Research is the open research collective defining, verifying,
              and publishing the frontier of AI agent skills.
            </p>
            <div className="actions">
              <a className="button button-primary" href="#research">
                Explore research <span>→</span>
              </a>
              <a className="button button-secondary" href="#ledger">
                View the ledger <span>→</span>
              </a>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-art-frame">
              <Image
                src={chiefScout}
                alt="Chief Scout mascot in the Gaia Research laboratory"
                priority
                sizes="(max-width: 800px) 100vw, 50vw"
              />
            </div>
            <p>CHIEF SCOUT / SIGNAL ACQUIRED</p>
          </div>
        </section>
        <section className="status-band" aria-label="Current research status">
          <div>
            <b>01</b>
            <span>flagship lab</span>
            <strong>Context Diet</strong>
          </div>
          <div>
            <b>04</b>
            <span>benchmark tracks</span>
            <strong>In formation</strong>
          </div>
          <div>
            <b>05</b>
            <span>ledger records</span>
            <strong>Publicly scoped</strong>
          </div>
          <p>
            <span className="led" /> Static launch indicators — live registry
            sync is pending.
          </p>
        </section>
        <ProjectGateways />
        <ResearchLedgerTable />
        <section
          className="suites section-shell"
          id="benchmarks"
          aria-labelledby="suites-title"
        >
          <div className="section-kicker">03 / TEST RANGE</div>
          <div className="section-heading-row">
            <div>
              <h2 id="suites-title">Benchmark Suites</h2>
              <p>
                Compact, legible evaluation surfaces. Data collection is staged;
                labels show the work honestly.
              </p>
            </div>
          </div>
          <div className="suite-grid">
            {suites.map(([name, kind, text], index) => (
              <article className="suite" key={name}>
                <span>
                  0{index + 1} / {kind}
                </span>
                <h3>{name}</h3>
                <p>{text}</p>
                <div className="suite-meter" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <small>Scope defined · results pending</small>
              </article>
            ))}
          </div>
        </section>
        <section
          className="protocol section-shell"
          id="protocol"
          aria-labelledby="protocol-title"
        >
          <div>
            <p className="section-kicker">04 / OPEN SCIENCE PROTOCOL</p>
            <h2 id="protocol-title">Evidence moves. Nothing disappears.</h2>
            <p>
              Research owns discovery and verification. Gaia Skill Tree owns
              inscription and permanence.
            </p>
          </div>
          <ol>
            {["Observe", "Benchmark", "Verify", "Publish", "Register"].map(
              (step, index) => (
                <li key={step}>
                  <span>0{index + 1}</span>
                  {step}
                </li>
              ),
            )}
          </ol>
        </section>
        <section
          className="tree-bridge section-shell"
          aria-labelledby="tree-title"
        >
          <div>
            <p className="section-kicker">05 / SECONDARY BRIDGE</p>
            <h2 id="tree-title">Gaia Skill Tree remembers.</h2>
            <p>
              When a capability survives the lab, it earns a durable place in
              the canonical registry.
            </p>
            <a
              className="button button-atlas"
              href="https://github.com/gaia-research/gaia-skill-tree"
            >
              Visit Gaia Skill Tree →
            </a>
          </div>
          <div className="tree-plaque">
            <span>HUNTER&apos;S ATLAS / PREVIEW</span>
            <b>
              Verified capabilities
              <br />
              deserve a permanent trace.
            </b>
            <small>Registry destination · external</small>
          </div>
        </section>
        <section
          className="directives section-shell"
          aria-labelledby="directives-title"
        >
          <div className="directive-heading">
            <Image src={milimAvatar} alt="Milim, Chief Capability Scout" />
            <div>
              <p className="section-kicker">06 / CHIEF SCOUT CONSOLE</p>
              <h2 id="directives-title">Milim Directives</h2>
            </div>
          </div>
          <ol>
            {directives.map((directive, index) => (
              <li key={directive}>
                <span>DIR-0{index + 1}</span>
                {directive}
              </li>
            ))}
          </ol>
        </section>
        <section
          className="community section-shell"
          id="community"
          aria-labelledby="community-title"
        >
          <p className="section-kicker">07 / OPEN INVITATION</p>
          <h2 id="community-title">Bring proof. Build the frontier.</h2>
          <p>
            The lab is public by design. Contribute a result, challenge a claim,
            or help shape the next benchmark.
          </p>
          <div className="actions">
            <a
              className="button button-primary"
              href="https://github.com/gaia-research/gaia-research"
            >
              Contribute on GitHub ↗
            </a>
            <a
              className="button button-secondary"
              href="https://github.com/gaia-research/gaia-research/tree/main/docs"
            >
              Read the Codex ↗
            </a>
          </div>
        </section>
      </main>
      <footer>
        <BrandMark />
        <p>The lab discovers. The registry remembers.</p>
        <div>
          <span>X pending</span>
          <span>Reddit pending</span>
          <a href="https://github.com/gaia-research">GitHub</a>
        </div>
      </footer>
    </>
  );
}
