import Image from "next/image";
import Link from "next/link";
import RegistryHandoff from "@/components/RegistryHandoff";
import MilimLive from "@/components/MilimLive";
import { HeroMilimBridge } from "@/components/HeroMilimBridge";
import CopyCommand from "@/components/CopyCommand";
import LabThumb from "@/components/labs/LabThumb";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { BlogPostCard } from "@/components/BlogPostCard";
import FieldManual from "@/components/FieldManual";
import { displayName, installCmd, ledger, repoUrl, skills, statusText, treeUrl } from "@/data/research";
import { blogPosts } from "@/data/blog";

const isExternal = (href: string) => href.startsWith("http");
const linkProps = (href: string) => (isExternal(href) ? { href, target: "_blank", rel: "noreferrer" } : { href });

export default function Home() {
 return <><SiteHeader /><main id="main">
  {/* 1. Existing homepage introduction */}
  <section className="hero" aria-labelledby="hero-title">
   <Image className="lab-plate" src="/assets/north-star-live/north-star-live-lab-plate-v01.webp" alt="" fill priority sizes="100vw" />
   <div className="hero-layout">
    <div className="hero-copy"><p className="signal"><span /> PUBLIC RESEARCH SIGNAL</p><h1 id="hero-title">Pushing the limits of <em>agent</em> capability.</h1><p className="hero-lede">Gaia Research is the open laboratory for evidence-first agent work. We measure the frontier in public &mdash; every claim tethered to its receipts.</p><div className="actions"><Link className="button primary" href="/blog">Read the Blog <span>→</span></Link><a className="button secondary" href="#ledger">Read the ledger <span>→</span></a></div></div>
    <MilimLive fallbackAlt="Milim, Gaia Research's Chief Capability Scout, standing in a laboratory hoodie." sizes="(max-width: 700px) 88vw, (max-width: 1200px) 46vw, 34vw" caption="MILIM · CHIEF CAPABILITY SCOUT" enableTooltips />
    <aside className="status-rail" aria-label="Laboratory status"><p>LABORATORY STATUS</p><dl><div><dt>LABS LIVE</dt><dd>02</dd></div><div><dt>LEDGER</dt><dd>OPEN</dd></div><div><dt>SOURCE</dt><dd>PUBLIC</dd></div></dl><a href="#directives">READ THE DIRECTIVES →</a></aside>
   </div>
   <div className="hero-strip"><span><i /> VERIFIED EVIDENCE</span><span>TWO LABS, ZERO SIGN-UPS</span><span>BUILDING IN PUBLIC</span></div>
  </section>

  {/* 2. Field Research */}
  <section id="blog" className="blog-home section-shell" aria-labelledby="blog-home-title">
   <header className="blog-home-intro">
    <div>
     <p className="signal"><span /> FROM THE BLOG</p>
     <h2 id="blog-home-title">A little field research.</h2>
     <p>Dispatches from the bench&mdash;where agent behavior gets strange before it gets useful.</p>
    </div>
    <Link href="/blog">All blog posts <span aria-hidden="true">→</span></Link>
   </header>
   <div className="blog-home-list">
    {blogPosts.slice(0, 3).map((post) => <BlogPostCard key={post.href} post={post} />)}
   </div>
  </section>

  {/* 3. Field Manual: Orchestration Guide + Agent Playbook */}
  <FieldManual />

  {/* 4. Skill Heaven */}
  {/* lexicon-allow: slug of the line name "Skill Heaven / Skill Hell" (canonical), not N9's retired repo name */}
  <section id="skill-heaven-hell" className="hh section-shell" aria-labelledby="hh-title">
   <header className="hh-intro">
    <p className="signal"><span /> HELL HEAVEN INDEX · ARC I VERIFIED</p>
    <h2 id="hh-title">Stop <em>installing</em> skills.<br />Start <em>summoning</em> them.</h2>
    <p className="hh-lede">Static marketplaces pin uninvited bloat to every repo. <b>Skill Zero</b> launches your harness with zero ambient skill debt; along the <b>Hell Heaven (HH) Index</b>, you summon only what the session earns.</p>
   </header>
   <div className="hh-poles">
    <article className="hh-pole hh-heaven">
     <span className="chip wip">☁ HEAVEN · AXIS WIP</span>
     <h3>Converge on the right few.</h3>
     <p>The lower-entropy summon direction: pulls the evidenced pool toward the small, sharp set an interactive session actually needs.</p>
    </article>
    <article className="hh-pole hh-hell">
     <span className="chip wip">🔥 HELL · GATED</span>
     <h3>Full gas, autopilot.</h3>
     <p>The higher-entropy direction for autonomous fleets and long loops&mdash;bounded by your chosen rung and the registry&rsquo;s measured trust gates.</p>
    </article>
   </div>
   <p className="hh-foot"><b>Skill Zero</b> is the usable launcher; per-skill <code>hellHeaven</code> polarity routing is in active research (currently relevance-ranked). <Link href="/research/hh-benchmark">Benchmark &amp; receipts →</Link> &middot; <Link href="/about">The three names →</Link> &middot; <a href="https://github.com/gaia-research/gaia-research/blob/main/docs/skill-heaven/VISION.md" target="_blank" rel="noreferrer">Vision ↗</a> &middot; <a href="https://github.com/gaia-research/gaia-research/blob/main/docs/skill-heaven/MISSION.md" target="_blank" rel="noreferrer">Mission ↗</a>.</p>
   <style>{`
    .hh{padding:clamp(2.4rem,5vw,4.2rem) var(--gutter);border-bottom:1px solid var(--line)}
    .hh-intro{max-width:62ch;margin:0 0 1.25rem}
    .hh-intro h2{font-size:var(--type-display-3);margin:.35rem 0 .75rem}
    .hh-intro h2 em{font-style:normal;color:var(--pink)}
    .hh-lede{color:var(--muted);font-size:1.0313rem;line-height:1.62;margin:0}
    .hh-lede a{color:var(--blue);border-bottom:1px solid var(--blue)}
    .hh-lede code{font-family:var(--mono);font-size:.9em;color:var(--ink)}
    .hh-poles{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin:1.25rem 0}
    .hh-pole{border:1px solid var(--line);background:rgba(11,12,19,.8);padding:1.25rem 1.35rem}
    .hh-pole h3{font-family:var(--display);text-transform:uppercase;letter-spacing:.03em;font-size:1.5rem;margin:.75rem 0 .45rem}
    .hh-pole p{color:var(--muted);font-size:.9125rem;line-height:1.58;margin:0}
    .hh-pole em{font-style:normal;color:var(--ink)}
    .hh-heaven{border-color:color-mix(in srgb,var(--blue) 45%,var(--line))}
    .hh-hell{border-color:color-mix(in srgb,var(--pink) 45%,var(--line))}
    .hh-foot{max-width:68ch;margin:0;color:var(--dim);font:var(--type-compact)/1.65 var(--mono);letter-spacing:.02em}
    .hh-foot code{color:var(--ink)}
    .hh-foot a{color:var(--blue);border-bottom:1px solid var(--blue)}
    @media(max-width:700px){.hh-poles{grid-template-columns:1fr}.hh-intro h2{font-size:clamp(2rem,9.5vw,2.75rem)}}
   `}</style>
  </section>

  {/* 5. Installable Skills */}
  <section id="skills" className="skills section-shell" aria-labelledby="skills-title"><header className="skills-intro"><h2 id="skills-title">Skills you can install today.</h2><p>Standalone skills for Claude Code, Cursor, and Windsurf. One line with <code>npx skills</code>&mdash;every check runs locally against your files.</p></header><div className="skill-grid">{skills.map((skill)=>{const name=displayName(skill.slug);return <article className="skill-card" key={skill.slug}><div className="skill-head"><h3>{name}</h3><span className={`chip ${skill.status.toLowerCase()}`}>{skill.status} {statusText[skill.status]}</span></div><p className="skill-blurb">{skill.blurb}</p><CopyCommand className="skill-install" command={installCmd(skill.slug)} /><div className="skill-links"><a href={repoUrl(skill.slug)} target="_blank" rel="noreferrer">Repo ↗</a>{skill.inTree && <a href={treeUrl(skill.slug)} target="_blank" rel="noreferrer">In the Skill Tree ↗</a>}{skill.surface && <a {...linkProps(skill.surface.href)}>{skill.surface.label} {isExternal(skill.surface.href) ? "↗" : "→"}</a>}</div></article>;})}</div></section>

  {/* 6. Labs & Games */}
  <section id="labs" className="labs-play section-shell" aria-labelledby="labs-play-title">
   <header className="labs-play-intro">
    <p className="signal"><span /> PULL A LEVER, SEE WHAT SPARKS</p>
    <h2 id="labs-play-title">Labs &amp; Games.</h2>
    <p>Browser-native instruments for poking at agent capability &mdash; no login, no upload, everything stays on your machine. Go ahead, boss. Break something.</p>
   </header>
   <div className="labs-play-grid">
    <Link className="play-card play-card-craft" href="/labs/infinite-skill-craft">
     <LabThumb kind="craft" />
     <div className="play-card-body">
      <span className="play-tag">Live · Game</span>
      <h3>Infinite Skill Craft</h3>
      <p>Fuse two dev skills and see what the forge invents. Then fuse the result. Infinite, obviously.</p>
      <span className="play-go">Start crafting <span aria-hidden="true">→</span></span>
     </div>
    </Link>
    <Link className="play-card play-card-diet" href="/labs/context-diet">
     <LabThumb kind="diet" />
     <div className="play-card-body">
      <span className="play-tag">Beta · Tool</span>
      <h3>Context Diet</h3>
      {/* lexicon-allow: "lean" here is ordinary English, not the posture */}<p>Feed it a bloated context file and watch it shrink to a lean, mean skill sliver. Weigh-in stays in your browser.</p>
      <span className="play-go">Trim a prompt <span aria-hidden="true">→</span></span>
     </div>
    </Link>
   </div>
  </section>

  <section id="ledger" className="ledger section-shell" aria-labelledby="ledger-title"><header className="ledger-intro"><div><h2 id="ledger-title">Claims deserve a trail.</h2></div><Link href="/research">Explore research →</Link></header><div className="table-wrap"><table><caption className="sr-only">Selected public research ledger entries</caption><thead><tr><th>Research item</th><th>Type</th><th>Status</th><th>Evidence note</th></tr></thead><tbody>{ledger.map(([name,type,status,note,href])=><tr key={name}><th scope="row">{href ? <a {...linkProps(href)}>{name}{isExternal(href) && " ↗"}</a> : name}</th><td>{type}</td><td><span className={`chip ${status.toLowerCase()}`}>{status} {statusText[status]}</span></td><td>{note}</td></tr>)}</tbody></table></div></section>

  <RegistryHandoff />

  <section id="directives" className="directives section-shell" aria-labelledby="directive-title"><div><p className="directive-note">A field note from Milim, Chief Capability Scout.</p><h2 id="directive-title">Make the science<br />louder than the hype.</h2></div><ol><li><b>01</b> Share the method. Let others inspect the work.</li><li><b>02</b> Verify before you flex. Evidence beats vibes.</li><li><b>03</b> Build safe, robust agents. Then publish the receipts.</li></ol><a className="button primary" href="https://gaiaskilltree.com" target="_blank" rel="noreferrer">Explore the Skill Tree <span>↗</span></a></section>
  <HeroMilimBridge />
 </main><SiteFooter /></>;
}
