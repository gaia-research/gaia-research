import Image from "next/image";
import Link from "next/link";
import RegistryHandoff from "@/components/RegistryHandoff";
import MilimLive from "@/components/MilimLive";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { gateways, ledger } from "@/data/research";

const statusText = { ACT: "ACTIVE", VRF: "VERIFIED", REV: "IN REVIEW", WIP: "EXPERIMENTAL" } as const;

export default function Home() {
 return <><SiteHeader /><main id="main">
  <section className="hero" aria-labelledby="hero-title">
   <Image className="lab-plate" src="/assets/north-star-live/north-star-live-lab-plate-v01.webp" alt="" fill priority sizes="(max-width: 700px) 180vw, 100vw" />
   <div className="hero-layout">
    <div className="hero-copy"><p className="signal"><span /> PUBLIC RESEARCH SIGNAL / 001</p><h1 id="hero-title">Pushing the limits of <em>agent</em> capability.</h1><p className="hero-lede">Gaia Research is the open laboratory for evidence-first agent work. We observe, benchmark, verify, and publish the frontier.</p><div className="actions"><Link className="button primary" href="/labs/context-diet">Enter Lab 001 <span>→</span></Link><a className="button secondary" href="#ledger">Read the ledger <span>→</span></a></div></div>
    <MilimLive fallbackSrc="/assets/north-star-live/milim-live-full-body-sprite-v01.webp" fallbackAlt="Milim, Gaia Research's Chief Capability Scout, standing in a laboratory hoodie." width={1024} height={1536} sizes="(max-width: 700px) 88vw, (max-width: 1200px) 46vw, 34vw" />
    <aside className="status-rail" aria-label="Live laboratory status"><p>LABORATORY STATUS</p><dl><div><dt>UPTIME</dt><dd>99.99%</dd></div><div><dt>ACTIVE RUNS</dt><dd>04</dd></div><div><dt>LEDGER</dt><dd>OPEN</dd></div></dl><a href="#directives">LIVE DIRECTIVES →</a></aside>
   </div>
   <div className="hero-strip"><span><i /> VERIFIED EVIDENCE</span><span>LAB 001 / RESULTS PENDING</span><span>BUILDING IN PUBLIC</span></div>
  </section>

  <section id="ledger" className="ledger section-shell" aria-labelledby="ledger-title"><header className="ledger-intro"><div><p className="ledger-kicker">RESEARCH LEDGER · 04 LIVE ENTRIES</p><h2 id="ledger-title">Claims deserve a trail.</h2></div><a href="https://github.com/gaia-research">Browse source ↗</a></header><div className="table-wrap"><table><caption className="sr-only">Selected public research ledger entries</caption><thead><tr><th>Research item</th><th>Type</th><th>Status</th><th>Evidence note</th></tr></thead><tbody>{ledger.map(([name,type,status,note,href])=><tr key={name}><th scope="row"><a href={href}>{name}</a></th><td>{type}</td><td><span className={`chip ${status.toLowerCase()}`}>{status} {statusText[status]}</span></td><td>{note}</td></tr>)}</tbody></table></div></section>

  <section className="gateways section-shell" aria-labelledby="gateway-title"><header className="gateway-intro"><span className="gateway-index">FIVE OPEN ROUTES</span><h2 id="gateway-title">The laboratory has more than one door.</h2><p>Pick a path: run a live surface, inspect the receipts, or take the work into the permanent registry.</p></header><div className="gateway-world">{gateways.map(([title,description,href,image], index)=><a className={`gateway gateway-${index+1}`} href={href} key={title}><Image src={image} alt="" fill sizes="(max-width: 700px) 100vw, 33vw" /><div><h3>{title}</h3><p>{description}</p><span>Open route →</span></div></a>)}</div></section>

  <RegistryHandoff />

  <section id="directives" className="directives section-shell" aria-labelledby="directive-title"><div><p className="directive-note">A field note from Milim, Chief Capability Scout.</p><h2 id="directive-title">Make the science<br />louder than the hype.</h2></div><ol><li><b>01</b> Share the method. Let others inspect the work.</li><li><b>02</b> Verify before you flex. Evidence beats vibes.</li><li><b>03</b> Build safe, robust agents. Then publish the receipts.</li></ol><a className="button primary" href="https://github.com/gaia-research">Contribute on GitHub <span>→</span></a></section>
 </main><SiteFooter /></>;
}
