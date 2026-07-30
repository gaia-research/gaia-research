import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { statusText } from "@/data/research";

// The canonical ecosystem explainer. It owns exactly one thing: the four names
// and how they relate. Every other doc keeps its own thesis and is linked from
// here, never restated — that is the rule that stops this page becoming a
// competing north star.
//
// TWO HARD CONSTRAINTS, both deliberate:
//   1. No repository name and no package name appears in this copy. How the
//      four names are packaged is an open question, and it must be free to
//      move without anyone rewriting this page.
//   2. Every state label is the true one. State words are NOT invented here —
//      they come from `statusText` in @/data/research, the same map the
//      homepage skills grid and the research ledger render from, so a chip
//      reads "ACT ACTIVE" / "WIP EXPERIMENTAL" exactly as it does there. Skill
//      Hell is the one exception and deliberately so: it reuses the homepage's
//      bespoke "🔥 HELL · GATED" treatment rather than any status key, because
//      gated is not a lifecycle state.

export const metadata: Metadata = {
  title: "About Gaia — one system, four names",
  description:
    "Gaia is an open capability control system for AI agents, built as four named parts: the Skill Tree, Research, Skill Heaven, and Skill Hell. What each one is, how they relate, and which one you want right now.",
  openGraph: {
    title: "About Gaia — one system, four names",
    description:
      "The Skill Tree, Research, Skill Heaven, and Skill Hell — what each name is, how they relate, and which one you want right now.",
    type: "website",
  },
};

const TREE = "https://gaiaskilltree.com";

// The homepage renders Hell as `chip wip` + "🔥 HELL · GATED" (app/page.tsx).
// Reused verbatim so the two surfaces cannot drift apart.
const HELL_CHIP = "🔥 HELL · GATED";

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="about-page">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="about-hero section-shell" aria-labelledby="about-title">
          <p className="signal">
            <span /> THE GAIA ECOSYSTEM
          </p>
          <h1 id="about-title">
            One system.<br />
            <em>Four</em> names.
          </h1>
          <p className="about-lede">
            Gaia is an open capability control system for AI agents. It is built as four
            named parts, and this page has exactly one job: tell you what each name is and
            how they relate. Every part keeps its own documentation — this page links to
            it and never repeats it.
          </p>
        </section>

        {/* ── What is Gaia ──────────────────────────────────────────────── */}
        <section className="about-what section-shell" aria-labelledby="about-what-title">
          <h2 id="about-what-title">What is Gaia?</h2>
          <p>
            Agents can now do far more than any one person can verify. Gaia&rsquo;s answer is
            to stop treating that as a single problem and split it into four questions that
            are usually mashed together:
          </p>
          <ol className="about-questions">
            <li>
              <b>What capabilities exist, and why should I trust them?</b>
            </li>
            <li>
              <b>What do they actually cost, and do they work?</b>
            </li>
            <li>
              <b>What should enter this session, right now?</b>
            </li>
            <li>
              <b>How far can that be pushed before it stops being safe?</b>
            </li>
          </ol>
          <p>
            Each question has a name. Keeping them apart is the whole design: one of them
            is a permanent public record, one is a laboratory, one runs inside your session,
            and one is not open yet.
          </p>
        </section>

        {/* ── The four names ────────────────────────────────────────────── */}
        <section className="about-names section-shell" aria-labelledby="about-names-title">
          <header className="about-names-intro">
            <p className="signal">
              <span /> THE FOUR NAMES
            </p>
            <h2 id="about-names-title">Who does what.</h2>
          </header>

          <article className="about-card" aria-labelledby="name-tree">
            <div className="about-card-head">
              <span className="about-role">THE RECORD</span>
              <span className="chip act">ACT {statusText.ACT}</span>
            </div>
            <h3 id="name-tree">Skill Tree</h3>
            <p>
              The permanent public record of what agent capabilities exist, who demonstrated
              each one first, and what evidence stands behind it. A skill is not an entry in
              a list — it is a record with a trail: its origin contributor, its evidence, its
              stars, and a timeline of how it earned them.
            </p>
            <p className="about-want">
              <b>You want this if</b> you are looking for a capability, checking whether one
              is trustworthy, or putting your own work on the record.
            </p>
            <a className="about-go" href={TREE} target="_blank" rel="noreferrer">
              Browse the Skill Tree <span aria-hidden="true">↗</span>
            </a>
          </article>

          <article className="about-card" aria-labelledby="name-research">
            <div className="about-card-head">
              <span className="about-role">THE LABORATORY</span>
              <span className="chip act">ACT {statusText.ACT}</span>
            </div>
            <h3 id="name-research">Research</h3>
            <p>
              The open laboratory that measures what capabilities really cost and whether
              they help — what a skill costs while merely listed, what it costs when invoked,
              and how different harnesses behave — then publishes the method along with the
              findings that went the other way. You are reading it right now.
            </p>
            <p className="about-want">
              <b>You want this if</b> you want the numbers behind a claim, or the method to
              reproduce it yourself.
            </p>
            <div className="about-go-row">
              <Link className="about-go" href="/research">
                Read the research ledger <span aria-hidden="true">→</span>
              </Link>
              <Link className="about-go" href="/blog">
                Read the blog <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>

          <article className="about-card about-card-heaven" aria-labelledby="name-heaven">
            <div className="about-card-head">
              <span className="about-role">THE RUNTIME</span>
              <span className="chip wip">WIP {statusText.WIP}</span>
            </div>
            <h3 id="name-heaven">Skill Heaven</h3>
            <p>
              The layer that decides what enters an agent&rsquo;s session and how much of it.
              Where the Tree answers <em>what exists and why trust it</em>, Skill Heaven
              answers <em>what should be in this context, right now</em> — one ladder from
              off to max, with a stated posture at every rung and the dose measured rather
              than guessed.
            </p>
            <p className="about-want">
              <b>You want this if</b> your agent&rsquo;s context is crowded with capabilities it
              is not using on this task, and you want that priced instead of assumed.
            </p>
            <p className="about-state">
              <b>Experimental.</b> The measurement is public before the product is. There is
              nothing to install from this page yet — when there is, it will say so here.
            </p>
            <Link className="about-go" href="/research/hh-benchmark">
              Read the benchmark method <span aria-hidden="true">→</span>
            </Link>

            {/* Skill Hell renders INSIDE the Heaven card, on purpose. It is a
                gated tier of Skill Heaven, not a separate thing you could go
                and get — nesting it is how the page says that without a
                sentence of disclaimer. It stays visibly present and visibly
                locked. */}
            <div className="about-locked" aria-labelledby="name-hell">
              <div className="about-card-head">
                <span className="about-role">
                  <span className="about-lock" aria-hidden="true">
                    🔒
                  </span>{" "}
                  A GATED TIER OF SKILL HEAVEN
                </span>
                <span className="chip wip">{HELL_CHIP}</span>
              </div>
              <h3 id="name-hell">Skill Hell</h3>
              <p>
                The other direction on the same ladder. Where Heaven admits a quiet session,
                Hell summons everything the evidenced world has to offer for long autonomous
                runs — still bounded by the rung you chose. It is a tier of Skill Heaven, not
                a separate part of Gaia.
              </p>
              <p className="about-state">
                <b>Gated, and staying gated</b> until measured trust coverage clears the gate.
                There is nothing to install, nothing to join, and no waiting list. When it
                opens, this is where it will say so.
              </p>
            </div>
          </article>
        </section>

        {/* ── How they relate ───────────────────────────────────────────── */}
        <section className="about-loop section-shell" aria-labelledby="about-loop-title">
          <header>
            <p className="signal">
              <span /> HOW THEY RELATE
            </p>
            <h2 id="about-loop-title">It is a loop, not a stack.</h2>
          </header>
          <ol className="about-loop-steps">
            <li>
              <span className="about-loop-n" aria-hidden="true">
                01
              </span>
              <span>
                <b>Research</b> measures cost, quality, failure, and harness behaviour.
              </span>
            </li>
            <li>
              <span className="about-loop-n" aria-hidden="true">
                02
              </span>
              <span>
                <b>The Skill Tree</b> records which capabilities are trusted, on what evidence,
                and by whom.
              </span>
            </li>
            <li>
              <span className="about-loop-n" aria-hidden="true">
                03
              </span>
              <span>
                <b>Skill Heaven</b> uses that record to decide what enters a session, and at
                what dose.
              </span>
            </li>
            <li>
              <span className="about-loop-n" aria-hidden="true">
                04
              </span>
              <span>
                <b>The run itself</b> produces new evidence — what it cost, what it fixed, what
                it broke — which goes back to Research.
              </span>
            </li>
          </ol>
          <p className="about-loop-note">
            Each rotation leaves the next one better informed. That is why the names stay
            separate: measuring, remembering, and admitting are different jobs. Fuse them and
            the thing making runtime decisions ends up grading its own homework.
          </p>
        </section>

        {/* ── Which one do I want ───────────────────────────────────────── */}
        <section className="about-pick section-shell" aria-labelledby="about-pick-title">
          <header>
            <p className="signal">
              <span /> START HERE
            </p>
            <h2 id="about-pick-title">Which one do I want right now?</h2>
          </header>
          <div className="table-wrap">
            <table>
              <caption className="sr-only">
                Reader intent mapped to a Gaia surface, its true state, and one concrete
                action
              </caption>
              <thead>
                <tr>
                  <th>If you want to&hellip;</th>
                  <th>Go to</th>
                  <th>State</th>
                  <th>Do this</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Find a capability, or check if one is trustworthy</th>
                  <td>Skill Tree</td>
                  <td>
                    <span className="chip act">ACT {statusText.ACT}</span>
                  </td>
                  <td>
                    <a href={TREE} target="_blank" rel="noreferrer">
                      Browse the Skill Tree ↗
                    </a>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Put your own skill on the public record</th>
                  <td>Skill Tree</td>
                  <td>
                    <span className="chip act">ACT {statusText.ACT}</span>
                  </td>
                  <td>
                    <a href={`${TREE}/en/getting-started.html`} target="_blank" rel="noreferrer">
                      Read the contributor path ↗
                    </a>
                  </td>
                </tr>
                <tr>
                  <th scope="row">See the numbers behind a claim, or reproduce one</th>
                  <td>Research</td>
                  <td>
                    <span className="chip act">ACT {statusText.ACT}</span>
                  </td>
                  <td>
                    <Link href="/research">Open the research ledger →</Link>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Understand what a crowded context costs you</th>
                  <td>Skill Heaven</td>
                  <td>
                    <span className="chip wip">WIP {statusText.WIP}</span>
                  </td>
                  <td>
                    <Link href="/research/hh-benchmark">Read the benchmark method →</Link>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Run fully autonomous, everything admitted</th>
                  <td>Skill Hell</td>
                  <td>
                    <span className="chip wip">{HELL_CHIP}</span>
                  </td>
                  <td>Nothing yet — it is gated on evidence, not on demand.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── What changed ──────────────────────────────────────────────── */}
        <section className="about-changed section-shell" aria-labelledby="about-changed-title">
          <header className="about-changed-head">
            <div>
              <p className="signal">
                <span /> WHAT CHANGED
              </p>
              <h2 id="about-changed-title">If you learned Gaia earlier.</h2>
            </div>
            <p className="about-rev">REVISION 1 &middot; 2026-07-29</p>
          </header>
          <p className="about-changed-lede">
            Some of what Gaia shipped this year <em>replaces</em> things people already
            learned. This is a standing surface, not an announcement: when something makes
            prior knowledge wrong, it gets a dated entry here.
          </p>

          <article className="about-entry">
            <h3>
              The four names <span className="about-date">2026-07-28</span>
            </h3>
            <p>
              Gaia is now told publicly as four names — the Skill Tree, Research, Skill
              Heaven, and Skill Hell. Nothing you already use changed; what changed is the
              map. Skill Heaven is named as the runtime layer and is experimental. Skill Hell
              is named and gated.
            </p>
          </article>

          <article className="about-entry">
            <h3>
              Yggdrasil II <span className="about-date">2026-07-07</span>
            </h3>
            <p>
              The Skill Tree&rsquo;s structure changed. If you learned it before this date, three
              things you know are now wrong: skill types collapsed from four to two, the
              progression branch is derived at read time and is never written down, and the
              rank words above three stars were renamed. Trust Magnitude became the single
              gate for ranking up.
            </p>
            <div className="about-go-row">
              <Link className="about-go" href="/blog/yggdrasil-ii">
                Read the explainer <span aria-hidden="true">→</span>
              </Link>
              <a className="about-go" href={`${TREE}/meta.html`} target="_blank" rel="noreferrer">
                Open the meta changelog <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        </section>

        {/* ── Close ─────────────────────────────────────────────────────── */}
        <section className="about-close section-shell" aria-labelledby="about-close-title">
          <h2 id="about-close-title">Every claim has a trail.</h2>
          <p>
            This page owns the relationships and nothing else. Each part of Gaia keeps its
            own thesis, its own docs, and its own receipts — and this is the page that tells
            you which one you are standing in.
          </p>
          <div className="actions">
            <a className="button primary" href={TREE} target="_blank" rel="noreferrer">
              Explore the Skill Tree <span>↗</span>
            </a>
            <Link className="button secondary" href="/research">
              Read the research <span>→</span>
            </Link>
          </div>
        </section>

        <style>{`
          .about-page section{padding:var(--space-dense) var(--gutter)}
          .about-hero{padding-top:var(--space-expansive)}
          .about-hero h1{margin:0 0 1.35rem;font-size:var(--type-display-2)}
          .about-lede{max-width:60ch;color:var(--muted);font-size:1.0625rem;line-height:1.7;margin:0}
          .about-what h2,.about-names h2,.about-loop h2,.about-pick h2,.about-changed h2,.about-close h2{font-size:var(--type-display-3);margin:.4rem 0 1rem}
          .about-what p,.about-loop-note,.about-changed-lede,.about-close p{max-width:64ch;color:var(--muted);line-height:1.7}
          .about-questions{max-width:64ch;margin:1.5rem 0;padding:0 0 0 1.4rem;color:var(--muted)}
          .about-questions li{padding:.45rem 0}
          .about-questions b{color:var(--ink);font-weight:600}
          .about-names-intro{max-width:64ch;margin-bottom:var(--space-tight)}
          .about-card{border:1px solid var(--line);background:rgba(11,12,19,.8);padding:clamp(1.25rem,3vw,2rem);margin-bottom:1.25rem}
          .about-card-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.75rem}
          .about-role{font:var(--type-compact)/1.4 var(--mono);letter-spacing:.08em;color:var(--dim)}
          .about-card h3{font-family:var(--display);text-transform:uppercase;letter-spacing:.03em;font-size:clamp(1.75rem,3vw,2.35rem);margin:.9rem 0 .8rem}
          .about-card p{max-width:66ch;color:var(--muted);line-height:1.7;margin:0 0 .9rem}
          .about-card em{font-style:normal;color:var(--ink)}
          .about-want b,.about-state b{color:var(--ink)}
          .about-state{color:var(--dim)!important;font-size:.9375rem}
          .about-card-heaven{border-color:color-mix(in srgb,var(--blue) 40%,var(--line))}
          .about-go{display:inline-block;font:var(--type-compact) var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--blue);border-bottom:1px solid var(--blue);padding-bottom:.25rem;min-height:44px;line-height:2.4}
          .about-go:hover{color:var(--pink);border-color:var(--pink)}
          .about-go-row{display:flex;flex-wrap:wrap;gap:.5rem 1.75rem}
          .about-locked{margin-top:clamp(1.5rem,3vw,2rem);border:1px dashed color-mix(in srgb,var(--pink) 55%,var(--line));background:repeating-linear-gradient(135deg,rgba(236,72,153,.05) 0 10px,transparent 10px 20px);padding:clamp(1.1rem,2.5vw,1.6rem)}
          .about-locked h3{font-size:clamp(1.4rem,2.4vw,1.85rem)}
          .about-lock{font-size:.95em}
          .about-loop-steps{list-style:none;margin:var(--space-tight) 0 1.5rem;padding:0;max-width:70ch;border-top:1px solid var(--line)}
          .about-loop-steps li{display:grid;grid-template-columns:3.25rem minmax(0,1fr);gap:1rem;padding:1.1rem 0;border-bottom:1px solid var(--line);color:var(--muted);line-height:1.65}
          .about-loop-steps b{color:var(--ink)}
          .about-loop-n{font:var(--type-compact) var(--mono);color:var(--pink);letter-spacing:.06em}
          .about-pick td a{color:var(--blue);border-bottom:1px solid var(--blue)}
          .about-pick td a:hover{color:var(--pink);border-color:var(--pink)}
          .about-changed-head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:1rem;margin-bottom:1rem}
          .about-rev{margin:0;font:var(--type-compact) var(--mono);letter-spacing:.08em;color:var(--dim)}
          .about-entry{border-top:1px solid var(--line);padding:1.5rem 0 .5rem;max-width:70ch}
          .about-entry h3{font-family:var(--display);text-transform:uppercase;letter-spacing:.03em;font-size:1.6rem;margin:0 0 .7rem;display:flex;flex-wrap:wrap;align-items:baseline;gap:.9rem}
          .about-date{font:var(--type-compact) var(--mono);letter-spacing:.06em;color:var(--dim)}
          .about-entry p{max-width:66ch;color:var(--muted);line-height:1.7}
          .about-close{border-top:1px solid var(--line)}
          @media(max-width:700px){
            .about-hero h1{font-size:clamp(2.75rem,12vw,4rem)}
            .about-loop-steps li{grid-template-columns:2.5rem minmax(0,1fr);gap:.75rem}
            .about-card-head{gap:.5rem}
          }
        `}</style>
      </main>
      <SiteFooter />
    </>
  );
}
