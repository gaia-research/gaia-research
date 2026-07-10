import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return <header className="site-header"><a className="skip-link" href="#main">Skip to content</a><nav aria-label="Primary navigation" className="nav-wrap">
    <Link className="brand" href="/"><Image className="brand-mark" src="/assets/brand/logo-mark.svg" alt="Gaia Research logo" width={30} height={30} /><span aria-hidden="true">GAIA <b>RESEARCH</b></span></Link>
    <div className="nav-links"><Link href="/#ledger">Ledger</Link><Link href="/labs/context-diet">Lab 001</Link><a href="https://gaiaskilltree.com" target="_blank" rel="noreferrer">Skill Tree ↗</a><a href="https://github.com/gaia-research" target="_blank" rel="noreferrer">Docs ↗</a></div>
    <details className="mobile-nav">
      <summary>Menu <span aria-hidden="true">+</span></summary>
      <div className="mobile-nav-menu">
        <Link href="/#ledger">Ledger</Link>
        <Link href="/labs/context-diet">Lab 001</Link>
        <a href="https://gaiaskilltree.com" target="_blank" rel="noreferrer">Skill Tree ↗</a>
        <a href="https://github.com/gaia-research" target="_blank" rel="noreferrer">Docs ↗</a>
        <a href="https://github.com/gaia-research" target="_blank" rel="noreferrer">GitHub ↗</a>
      </div>
    </details>
    <a className="nav-github" href="https://github.com/gaia-research" target="_blank" rel="noreferrer">GitHub ↗</a>
  </nav></header>;
}

export function SiteFooter() {
  return <footer className="site-footer"><div className="footer-brand"><Image className="brand-mark" src="/assets/brand/logo-mark.svg" alt="Gaia Research logo" width={26} height={26} /><strong>GAIA RESEARCH</strong><p>Open evidence for agent capability research.</p></div><div className="footer-links"><a href="https://x.com/gaia" target="_blank" rel="noreferrer">X</a><a href="https://www.reddit.com/" target="_blank" rel="noreferrer">Reddit</a><a href="https://github.com/gaia-research" target="_blank" rel="noreferrer">GitHub</a></div><p className="system"><span aria-hidden="true">●</span> SYSTEMS NOMINAL<br />PUBLIC LAB / 2026</p></footer>;
}
