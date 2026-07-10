import Image from "next/image";
import Link from "next/link";
import RegistryHandoff from "@/components/RegistryHandoff";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { displayName, installCmd, ledger, repoUrl, skills, treeUrl } from "@/data/research";

const statusText = { ACT: "ACTIVE", VRF: "VERIFIED", REV: "IN REVIEW", WIP: "EXPERIMENTAL" } as const;

const isExternal = (href: string) => href.startsWith("http");
const linkProps = (href: string) => (isExternal(href) ? { href, target: "_blank", rel: "noreferrer" } : { href });

export default function Home() {
 return <><SiteHeader /><main id="main">
  <section className="hero" aria-labelledby="hero-title">
   <Image className="lab-plate" src="/assets/north-star-live/north-star-live-lab-plate-v01.webp" alt="" fill priority sizes="100vw" />
   <div className="hero-layout">
    <div className="hero-copy"><p className="signal"><span /> PUBLIC RESEARCH SIGNAL</p><h1 id="hero-title">Pushing the limits of <em>agent</em> capability.</h1><p className="hero-lede">Gaia Research is the open laboratory for evidence-first agent work. We observe, benchmark, verify, and publish the frontier &mdash; every claim links back to its receipts.</p><div className="actions"><Link className="button primary" href="/labs/context-diet">Enter Lab 001 · Context Diet <span>→</span></Link><a className="button secondary" href="#ledger">Read the ledger <span>→</span></a></div></div>
    <div className="live-stage" aria-label="Milim is represented by a decorative, code-driven 2.5D idle sprite loop."><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="spark-field" aria-hidden="true">✦ · ✦ · ✦</div><div className="sprite-reflection" aria-hidden="true" /><Image className="milim-sprite" src="/assets/north-star-live/milim-live-full-body-sprite-v01.webp" alt="Milim, Gaia Research's Chief Capability Scout, standing in a laboratory hoodie." width={1024} height={1536} priority sizes="(max-width: 700px) 88vw, (max-width: 1200px) 46vw, 34vw" /><p className="sprite-caption">MILIM · CHIEF CAPABILITY SCOUT</p></div>
    <aside className="status-rail" aria-label="Laboratory status"><p>LABORATORY STATUS</p><dl><div><dt>LABS LIVE</dt><dd>01</dd></div><div><dt>LEDGER</dt><dd>OPEN</dd></div><div><dt>SOURCE</dt><dd>PUBLIC</dd></div></dl><a href="#directives">READ THE DIRECTIVES →</a></aside>
   </div>
   <div className="hero-strip"><span><i /> VERIFIED EVIDENCE</span><span>LAB 001 / RESULTS PENDING</span><span>BUILDING IN PUBLIC</span></div>
  </section>

  <section id="skills" className="skills section-shell" aria-labelledby="skills-title"><header className="skills-intro"><h2 id="skills-title">Skills you can install today.</h2><p>Local-first Claude Code / Cursor / Windsurf skills. One line to install with the Gaia CLI &mdash; they run against your files and never upload their contents.</p></header><div className="skill-grid">{skills.map((skill)=>{const name=displayName(skill.slug);return <article className="skill-card" key={skill.slug}><div className="skill-head"><h3>{name}</h3><span className={`chip ${skill.status.toLowerCase()}`}>{skill.status} {statusText[skill.status]}</span></div><p className="skill-blurb">{skill.blurb}</p><code className="skill-install" aria-label={`Install with: ${installCmd(skill.slug)}`}><span aria-hidden="true">$ </span>{installCmd(skill.slug)}</code><div className="skill-links"><a href={repoUrl(skill.slug)} target="_blank" rel="noreferrer">Repo ↗</a>{skill.inTree && <a href={treeUrl(skill.slug)} target="_blank" rel="noreferrer">In the Skill Tree ↗</a>}{skill.surface && <a {...linkProps(skill.surface.href)}>{skill.surface.label} {isExternal(skill.surface.href) ? "↗" : "→"}</a>}</div></article>;})}</div></section>

  <section id="ledger" className="ledger section-shell" aria-labelledby="ledger-title"><header className="ledger-intro"><div><h2 id="ledger-title">Claims deserve a trail.</h2></div></header><div className="table-wrap"><table><caption className="sr-only">Selected public research ledger entries</caption><thead><tr><th>Research item</th><th>Type</th><th>Status</th><th>Evidence note</th></tr></thead><tbody>{ledger.map(([name,type,status,note,href])=><tr key={name}><th scope="row">{href ? <a {...linkProps(href)}>{name}{isExternal(href) && " ↗"}</a> : name}</th><td>{type}</td><td><span className={`chip ${status.toLowerCase()}`}>{status} {statusText[status]}</span></td><td>{note}</td></tr>)}</tbody></table></div></section>

  <RegistryHandoff />

  <section id="directives" className="directives section-shell" aria-labelledby="directive-title"><div><p className="directive-note">A field note from Milim, Chief Capability Scout.</p><h2 id="directive-title">Make the science<br />louder than the hype.</h2></div><ol><li><b>01</b> Share the method. Let others inspect the work.</li><li><b>02</b> Verify before you flex. Evidence beats vibes.</li><li><b>03</b> Build safe, robust agents. Then publish the receipts.</li></ol><a className="button primary" href="https://gaiaskilltree.com" target="_blank" rel="noreferrer">Explore the Skill Tree <span>↗</span></a></section>
 </main><SiteFooter /></>;
}
