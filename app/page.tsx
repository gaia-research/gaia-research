import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { ProjectGateways } from "@/components/research/ProjectGateways";
import { ResearchLedgerTable } from "@/components/research/ResearchLedgerTable";
import { directives } from "@/lib/data/research";

const suites = [
  ["G-Bench", "Generalist suite", "Capability coverage across tools, planning, and execution."],
  ["Safety alignment", "Evaluation set", "Tests for constraints, recovery, and refusal quality."],
  ["Memory", "Architecture analysis", "What persists, decays, and remains attributable."],
  ["Protocol fusion", "Active research", "How compatible skills compose under explicit evidence."],
];

const directivesMeta = ["OPEN SCIENCE", "VERIFICATION", "FUSION", "SAFETY"];

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to research content</a>
      <header className="site-header">
        <BrandMark />
        <nav aria-label="Primary navigation">
          <a href="#research">Research</a>
          <a href="#ledger">Ledger</a>
          <a href="#benchmarks">Benchmarks</a>
          <Link href="/labs/context-diet">Lab 001</Link>
          <a href="#directives">Directives</a>
        </nav>
        <a className="header-github" href="https://github.com/gaia-research/gaia-research">
          GitHub <span aria-hidden="true">↗</span>
        </a>
      </header>
      <main id="main-content">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-overlay" aria-hidden="true" />
          <div className="hero-copy">
            <p className="eyebrow"><span className="led" />Open science / verified capabilities / limitless potential</p>
            <h1 id="hero-title">Pushing the limits of <em>AI agent</em> capabilities.</h1>
            <p className="hero-description">
              Gaia Research is the open collective for testing agent capability claims in public—through rigorous evaluation, inspectable protocols, and useful evidence.
            </p>
            <div className="actions">
              <a className="button button-primary" href="#ledger">Explore research <span aria-hidden="true">→</span></a>
              <Link className="button button-secondary" href="/labs/context-diet">Enter Lab 001 <span aria-hidden="true">→</span></Link>
            </div>
            <p className="hero-footnote">FIELD NOTE 001 · Evidence first. Hype last.</p>
          </div>
          <figure className="hero-visual">
            <div className="visual-stamp">TEMPORARY FIELD VISUAL<br /><span>ART DIRECTION IN ITERATION</span></div>
            <picture>
              <source media="(max-width: 640px)" srcSet="/images/chief-scout/chief-scout-hero-mobile-3-4.avif" type="image/avif" />
              <source media="(max-width: 1000px)" srcSet="/images/chief-scout/chief-scout-hero-tablet-4-3.avif" type="image/avif" />
              <source media="(max-width: 640px)" srcSet="/images/chief-scout/chief-scout-hero-mobile-3-4.webp" type="image/webp" />
              <source media="(max-width: 1000px)" srcSet="/images/chief-scout/chief-scout-hero-tablet-4-3.webp" type="image/webp" />
              <source srcSet="/images/chief-scout/chief-scout-hero-desktop-16-9.avif" type="image/avif" />
              <img src="/images/chief-scout/chief-scout-hero-desktop-16-9.webp" alt="Temporary Chief Scout laboratory field visual" fetchPriority="high" />
            </picture>
            <figcaption className="visual-caption"><span className="led led-blue" /> SIGNAL ACQUIRED / STATIC PLACEHOLDER</figcaption>
          </figure>
          <aside className="hero-rail" aria-labelledby="rail-title">
            <div className="rail-heading"><span className="spark" aria-hidden="true">✦</span><h2 id="rail-title">Live directives</h2><a href="#directives">View all</a></div>
            <ol className="rail-list">
              <li><span className="rail-tag tag-pink">LAB 001</span><strong>Context Diet is now the flagship benchmark surface.</strong><Link href="/labs/context-diet">Enter lab <span aria-hidden="true">→</span></Link></li>
              <li><span className="rail-tag tag-blue">RESEARCH</span><strong>G-Bench scope is forming in public.</strong><a href="#benchmarks">Read test range <span aria-hidden="true">→</span></a></li>
              <li><span className="rail-tag tag-amber">INVITE</span><strong>Bring a result, counterexample, or protocol.</strong><a href="#community">Join the mission <span aria-hidden="true">→</span></a></li>
            </ol>
            <p className="rail-empty">○ Live feed not connected. These are current static notices.</p>
          </aside>
        </section>
        <section className="status-band" aria-label="Research system status">
          <div><b>01</b><span>Flagship lab</span><strong>Context Diet</strong></div>
          <div><b>04</b><span>Benchmark tracks</span><strong>In formation</strong></div>
          <div><b>05</b><span>Ledger records</span><strong>Publicly scoped</strong></div>
          <p><span className="led led-blue" /> System status: static launch index / registry sync pending</p>
        </section>
        <ResearchLedgerTable />
        <ProjectGateways />
        <section className="suites section-shell" id="benchmarks" aria-labelledby="suites-title">
          <div className="section-kicker">03 / Test range</div>
          <div className="section-heading-row"><div><h2 id="suites-title">Benchmark suites</h2><p>Compact, legible evaluation surfaces. Collection is staged; the labels say so.</p></div></div>
          <div className="suite-grid">
            {suites.map(([name, kind, text], index) => <article className="suite" key={name}><span>0{index + 1} / {kind}</span><h3>{name}</h3><p>{text}</p><div className="suite-meter" aria-hidden="true"><i /><i /><i /><i /><i /></div><small>Scope defined · results pending</small></article>)}
          </div>
        </section>
        <section className="protocol section-shell" id="protocol" aria-labelledby="protocol-title">
          <div><p className="section-kicker">04 / Open science protocol</p><h2 id="protocol-title">Evidence moves. Nothing disappears.</h2><p>Research owns discovery and verification. Gaia Skill Tree owns durable inscription.</p></div>
          <ol>{["Observe", "Benchmark", "Verify", "Publish", "Register"].map((step, index) => <li key={step}><span>0{index + 1}</span>{step}</li>)}</ol>
        </section>
        <section className="tree-bridge section-shell" aria-labelledby="tree-title">
          <div><p className="section-kicker">05 / Registry bridge</p><h2 id="tree-title">Gaia Skill Tree remembers.</h2><p>When a capability survives the lab, it earns a durable place in the canonical registry.</p><a className="button button-secondary" href="https://github.com/gaia-research/gaia-skill-tree">Visit Gaia Skill Tree <span aria-hidden="true">↗</span></a></div>
          <div className="tree-plaque"><span>CANONICAL REGISTRY / EXTERNAL</span><b>Verified capabilities deserve a permanent trace.</b><small>Inspect records, then build the next proof.</small></div>
        </section>
        <section className="directives section-shell" id="directives" aria-labelledby="directives-title">
          <div className="directive-art" aria-hidden="true"><img src="/images/milim/milim-avatar-128.webp" alt="" /><span>✦</span></div>
          <div className="directive-body"><div className="directive-heading"><p className="section-kicker">06 / Chief Scout console</p><h2 id="directives-title">Milim directives</h2><p>Orders from the field: make the science stronger, boss.</p></div><ol>{directives.map((directive, index) => <li key={directive}><span>DIR-0{index + 1} / {directivesMeta[index]}</span>{directive}</li>)}</ol></div>
        </section>
        <section className="community section-shell" id="community" aria-labelledby="community-title">
          <p className="section-kicker">07 / Open invitation</p><h2 id="community-title">Bring proof. Build the frontier.</h2><p>The lab is public by design. Contribute a result, challenge a claim, or help shape the next benchmark.</p><div className="actions"><a className="button button-primary" href="https://github.com/gaia-research/gaia-research">Contribute on GitHub <span aria-hidden="true">↗</span></a><a className="button button-secondary" href="https://github.com/gaia-research/gaia-research/tree/main/docs">Read the codex <span aria-hidden="true">↗</span></a></div>
        </section>
      </main>
      <footer className="site-footer"><div><BrandMark /><p>The lab discovers.<br />The registry remembers.</p></div><div className="footer-nav"><b>Navigation</b><a href="#ledger">Research ledger</a><Link href="/labs/context-diet">Context Diet / Lab 001</Link><a href="#benchmarks">Benchmarks</a></div><div className="footer-nav"><b>Signal</b><a href="https://x.com/gaia_research">X ↗</a><a href="https://www.reddit.com/">Reddit ↗</a><a href="https://github.com/gaia-research">GitHub ↗</a></div><div className="system-panel"><span><i className="led led-blue" />System status</span><strong>STATIC / OPERATIONAL</strong><small>Registry sync is staged.</small></div></footer>
    </>
  );
}
