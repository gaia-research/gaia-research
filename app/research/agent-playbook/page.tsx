import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import CopyPrompt from "@/components/CopyPrompt";
import "./playbook.css";

// Every claim on this page is sourced from gaia-research/agent-playbook at the
// revision below. If the repository changes materially, re-check the copy.
const REPO = "https://github.com/gaia-research/agent-playbook";
const BLOB = `${REPO}/blob/main`;
const TREE = `${REPO}/tree/main`;
const RAW = "https://raw.githubusercontent.com/gaia-research/agent-playbook/main";
const SOURCE_REV = "9346fc1";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "The Agent Playbook",
  description:
    "A portable, repository-backed operating philosophy for AI agents. Read it into a chat assistant as context, optionally install its orchestrate and prompting skills with consent, and swap in your own personal profile.",
  alternates: { canonical: "/research/agent-playbook" },
  openGraph: {
    title: "The Agent Playbook · Gaia Research",
    description: "Your agent shouldn't have to rediscover how you want it to work. Plain documents, two optional skills, one swappable profile.",
    url: "/research/agent-playbook",
  },
};

const MEMORY_PROMPT = `Read the Agent Playbook at ${REPO}.
Start with MEMORY.md, then PLAYBOOK.md.

1. Summarize its operating philosophy in a few lines.
2. Propose memory entries. Keep universal defaults separate from
   personal preferences, and note the source and today's date.
3. Do not adopt the example profile in profiles/marco unless I ask.
4. Tell me what this platform can actually save. Save nothing until
   I approve each entry, then tell me exactly what was saved.

Reading this playbook does not authorize installing anything or
running commands.`;

const SKILLS_PROMPT = `I'm considering the optional skills in
${REPO}
(skills/orchestrate and/or skills/prompting). Read its README.md and
profiles/marco/harnesses.md first.

Before changing anything:
1. Identify this harness, its version, and the skill format and
   discovery location it documents.
2. Show me which skill directories you would copy, the destination
   (user or project scope), and any existing files they collide with.
3. Wait for my explicit yes.

After I approve: copy only the selected skill directories, unchanged.
No hooks, extensions, dependencies or config changes. Then verify the
skill is discovered and report exactly what was installed where.`;

const RECEIPT = `PR: <number and URL>
Commit: <pushed HEAD SHA>
Handoff: <repository-relative path>
Status: READY FOR REVIEW | BLOCKED`;

const continuity = [
  {
    ask: "CI is green. Can I merge?",
    answer: "Preview, push, merge and deploy are separate permissions. Approving a preview never implies merge authorization.",
    src: "PLAYBOOK.md · Authority",
  },
  {
    ask: "The model you asked for is unavailable. Use another?",
    answer: "No silent fallback. A missing identity or changed billing route needs a visible diagnostic and your choice.",
    src: "skills/orchestrate",
  },
  {
    ask: "Should I fan this out to five subagents?",
    answer: "Only for independent work whose benefit beats coordination cost, with concurrency and budget bounded before dispatch.",
    src: "PLAYBOOK.md · Intent, evidence, and cost",
  },
  {
    ask: "How do I report that I'm done?",
    answer: "Separate what ran, passed and was skipped. Unknown is not passed. Close with the exact four-line receipt.",
    src: "PLAYBOOK.md · Completion",
  },
];

const harnesses = [
  ["Claude Code", ".claude/skills/<name>/SKILL.md", "~/.claude/skills/<name>/SKILL.md", "https://code.claude.com/docs/en/skills"],
  ["Codex", ".agents/skills/<name>/SKILL.md", "~/.agents/skills/<name>/SKILL.md", "https://learn.chatgpt.com/docs/build-skills"],
  ["Pi", ".agents/skills/<name>/SKILL.md", "~/.agents/skills/<name>/SKILL.md", "https://pi.dev/docs/latest/skills"],
] as const;

const templateFields = [
  "Preferred communication and evidence",
  "Roles and agent naming",
  "Verified model aliases, tiers and supported efforts, with source and date",
  "Task routing, cost and latency budgets, concurrency limits",
  "Explicit fallback and escalation rules",
  "Harnesses and separately authorized optional setup",
  "Handoff convention and preview / merge / deployment permissions",
  "Rationale, superseded preferences and unresolved conflicts",
];

const ext = { target: "_blank", rel: "noreferrer" } as const;
const NewTab = () => <span className="sr-only"> (opens in a new tab)</span>;

export default function AgentPlaybookPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="apb">
        <section className="apb-hero" aria-labelledby="apb-title">
          <div className="apb-hero-copy">
            <p className="apb-kicker"><Link href="/research">Research</Link> <span aria-hidden="true">/</span> Agent Playbook</p>
            <h1 id="apb-title">Stop <span className="apb-nowrap">re-explaining</span> yourself to every new agent.</h1>
            <p className="apb-lede">
              The Agent Playbook is a small public repository of plain documents: how you want AI work directed, written down once.
              A chat assistant can read it as context. A coding agent can install two of its skills, if you say yes.
              Your personal choices live in a profile you can swap out.
            </p>
            <div className="apb-hero-actions">
              <a className="apb-btn apb-btn-read" href="#memory">Read as memory <span aria-hidden="true">↓</span></a>
              <a className="apb-btn apb-btn-install" href="#skills">Install optional skills <span aria-hidden="true">↓</span></a>
              <a className="apb-textlink" href={REPO} {...ext}>View on GitHub ↗<NewTab /></a>
            </div>
            <p className="apb-meta">MIT licensed · plain Markdown and YAML · no runtime, no installer, no account</p>
          </div>

          <figure className="apb-map" aria-labelledby="apb-map-cap">
            <figcaption id="apb-map-cap"><span>agent-playbook/</span><span>what each part is for</span></figcaption>
            <ul>
              <li className="apb-map-l1"><a href={`${BLOB}/MEMORY.md`} {...ext}>MEMORY.md<NewTab /></a><span>start here · conversational entry</span><b>Layer 1</b></li>
              <li className="apb-map-l1"><a href={`${BLOB}/PLAYBOOK.md`} {...ext}>PLAYBOOK.md<NewTab /></a><span>the canonical policy</span><b>Layer 1</b></li>
              <li className="apb-map-dir">skills/</li>
              <li className="apb-map-l2 apb-map-sub"><a href={`${BLOB}/skills/orchestrate/SKILL.md`} {...ext}>orchestrate/<NewTab /></a><span>route &amp; coordinate work</span><b>Layer 2</b></li>
              <li className="apb-map-l2 apb-map-sub"><a href={`${BLOB}/skills/prompting/SKILL.md`} {...ext}>prompting/<NewTab /></a><span>write compact briefs</span><b>Layer 2</b></li>
              <li className="apb-map-dir">profiles/</li>
              <li className="apb-map-l3 apb-map-sub"><a href={`${TREE}/profiles/marco`} {...ext}>marco/<NewTab /></a><span>a real, dated example</span><b>Layer 3</b></li>
              <li className="apb-map-l3 apb-map-sub"><a href={`${BLOB}/profiles/template/PROFILE.md`} {...ext}>template/<NewTab /></a><span>yours to fill in</span><b>Layer 3</b></li>
              <li className="apb-map-dir"><a href={`${TREE}/examples`} {...ext}>examples/<NewTab /></a><span>a task brief, a review brief</span></li>
            </ul>
          </figure>
        </section>

        <nav className="apb-toc" aria-label="On this page">
          <a href="#why">Why it exists</a><a href="#layers">Three layers</a><a href="#memory">Read as memory</a>
          <a href="#skills">Install skills</a><a href="#profile">Personal profile</a><a href="#limits">Limits</a>
        </nav>

        <section id="why" className="apb-section" aria-labelledby="why-title">
          <header className="apb-section-head">
            <p className="apb-num">01</p>
            <h2 id="why-title">Same questions, every new session.</h2>
            <p>
              A new conversation starts with none of your conventions. The agent either asks again or guesses. The playbook gives
              those recurring decisions a written, versioned answer.
            </p>
          </header>
          <ol className="apb-continuity">
            {continuity.map((row) => (
              <li key={row.ask}>
                <p className="apb-ask"><span>Agent, without it</span>{row.ask}</p>
                <p className="apb-answer"><span>What the playbook tells it</span>{row.answer}<small>{row.src}</small></p>
              </li>
            ))}
          </ol>
          <div className="apb-receipt">
            <div>
              <h3>A finish line that reads the same everywhere.</h3>
              <p>
                When GitHub delivery is authorized, work ends with a pushed branch, a PR, a committed handoff report and this receipt,
                whichever model or harness did the work. <i>READY FOR REVIEW</i> means delivered for review: not approved, not deployed.
              </p>
            </div>
            <pre aria-label="The playbook's four-line delivery receipt"><code>{RECEIPT}</code></pre>
          </div>

          <div className="apb-compare-wrap">
            <h3 className="apb-h3">Not another prompt template.</h3>
            <div className="apb-table">
              <table>
                <caption className="sr-only">How the Agent Playbook differs from a prompt template</caption>
                <thead><tr><th scope="col"><span className="sr-only">Aspect</span></th><th scope="col">Prompt template</th><th scope="col">Agent Playbook</th></tr></thead>
                <tbody>
                  <tr><th scope="row">Covers</th><td>The wording of one kind of task</td><td>How you want work directed, across tasks</td></tr>
                  <tr><th scope="row">Lives in</th><td>A snippet you paste</td><td>A git repository with history and reviewed PRs</td></tr>
                  <tr><th scope="row">Authority</th><td>Usually unstated</td><td>Explicit order: your current instruction, then project rules, then an adopted profile, then defaults</td></tr>
                  <tr><th scope="row">Personal choices</th><td>Baked into the text</td><td>Kept in a profile you can replace without touching the skills</td></tr>
                  <tr><th scope="row">Changes</th><td>Edit and re-paste</td><td>Compare revisions; memory changes only when you direct it</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="layers" className="apb-section" aria-labelledby="layers-title">
          <header className="apb-section-head">
            <p className="apb-num">02</p>
            <h2 id="layers-title">Three layers, adopted separately.</h2>
            <p>Take one, two or all three. Adopting one never implies permission for the next.</p>
          </header>
          <div className="apb-layers">
            <article className="apb-layer apb-layer-1">
              <p className="apb-layer-tag">Layer 1 · Memory &amp; context</p>
              <h3>Any assistant can read it.</h3>
              <p>
                <code>MEMORY.md</code> is a self-contained summary written for ingestion; <code>PLAYBOOK.md</code> is the full policy.
                The assistant proposes memory entries and you approve them. Whether anything persists depends on your platform.
              </p>
              <a href="#memory">How to read it in →</a>
            </article>
            <article className="apb-layer apb-layer-2">
              <p className="apb-layer-tag">Layer 2 · Optional skills</p>
              <h3>Coding agents can install two.</h3>
              <p>
                <code>orchestrate</code> routes and coordinates bounded work. <code>prompting</code> writes compact briefs with
                intent, authority and a falsifiable done condition. Neither needs Pi or private infrastructure.
              </p>
              <a href="#skills">How to install with consent →</a>
            </article>
            <article className="apb-layer apb-layer-3">
              <p className="apb-layer-tag">Layer 3 · Personal configuration</p>
              <h3>Your choices, kept apart.</h3>
              <p>
                Model preferences, concurrency, effort and naming live in a profile. Marco&rsquo;s is a real, dated example. The
                template is a blank one. The core skills work with either.
              </p>
              <a href="#profile">See the example profile →</a>
            </article>
          </div>
        </section>

        <section id="memory" className="apb-section apb-path apb-path-read" aria-labelledby="memory-title">
          <header className="apb-section-head">
            <p className="apb-num">03</p>
            <p className="apb-path-label"><span aria-hidden="true">◇</span> Path A · Read as memory · no installation</p>
            <h2 id="memory-title">Give a chat assistant the context.</h2>
            <p>
              Works with a conversational AI such as ChatGPT or Claude. This is not an automatic memory importer: the assistant reads
              the documents, proposes what to keep, and saves only what you approve, where the platform supports saving at all.
            </p>
          </header>
          <div className="apb-path-grid">
            <ol className="apb-steps">
              <li><b>Open a new conversation</b> with an assistant that can read web pages. If it can&rsquo;t, paste the contents of{" "}
                <a href={`${RAW}/MEMORY.md`} {...ext}>MEMORY.md (raw)<NewTab /></a> and{" "}
                <a href={`${RAW}/PLAYBOOK.md`} {...ext}>PLAYBOOK.md (raw)<NewTab /></a> instead.</li>
              <li><b>Paste the prompt.</b> It asks for a summary and proposed entries, and withholds the personal profile until you opt in.</li>
              <li><b>Review each proposed entry.</b> Approve, edit or drop it. Live model availability, prices, credentials and private endpoints should stay out of memory.</li>
              <li><b>Check what was actually saved.</b> If your platform cannot persist memory, the playbook still applies for that conversation, and you can keep the proposed entries as text.</li>
            </ol>
            <CopyPrompt id="memory-prompt" label="Prompt for a chat assistant" text={MEMORY_PROMPT} />
          </div>
          <p className="apb-note">
            A request to remember these principles grants no permission to install skills, run commands, change credentials or deploy.
            Editing the repository later does not update anyone&rsquo;s memory; re-run the review when you want to adopt a new revision.
          </p>
        </section>

        <section id="skills" className="apb-section apb-path apb-path-install" aria-labelledby="skills-title">
          <header className="apb-section-head">
            <p className="apb-num">04</p>
            <p className="apb-path-label"><span aria-hidden="true">◆</span> Path B · Install optional skills · requires your consent</p>
            <h2 id="skills-title">Let your coding agent propose the install.</h2>
            <p>
              There is no one-line installer, deliberately. A skill is a directory with a <code>SKILL.md</code>; your agent checks how
              <i> your</i> harness discovers skills, shows you a copy plan, and copies nothing until you agree.
            </p>
          </header>
          <div className="apb-path-grid">
            <div>
              <ol className="apb-steps">
                <li><b>Pick</b> <code>orchestrate</code>, <code>prompting</code> or both, and user or project scope.</li>
                <li><b>Inspect.</b> The agent reads the harness&rsquo;s current docs and your existing skill folders, then shows files, destination and collisions.</li>
                <li><b>Consent.</b> Nothing is copied before your explicit yes. No hooks, extensions or dependencies come along.</li>
                <li><b>Verify.</b> The agent confirms the skill is discovered and rolls back only its own files if it isn&rsquo;t.</li>
              </ol>
              <div className="apb-table apb-harness">
                <table>
                  <caption>Documented discovery locations, from the repository&rsquo;s harness notes</caption>
                  <thead><tr><th scope="col">Harness</th><th scope="col">Project</th><th scope="col">User</th></tr></thead>
                  <tbody>
                    {harnesses.map(([name, project, user, docs]) => (
                      <tr key={name}>
                        <th scope="row"><a href={docs} {...ext}>{name} ↗<NewTab /></a></th>
                        <td><code>{project}</code></td>
                        <td><code>{user}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="apb-fine">
                Locations come from each harness&rsquo;s official documentation, read 2026-11-08. The repository records that no live
                installation was tested; managed policies and cloud sessions can differ. Ask your agent to confirm against current docs.
              </p>
            </div>
            <CopyPrompt id="skills-prompt" label="Prompt for a coding agent" text={SKILLS_PROMPT} />
          </div>
          <p className="apb-note">
            Installing a skill gives an agent a procedure, not authority. The orchestrate skill itself says not to install integrations
            or widen merge or deployment permissions just to finish a task.
          </p>
        </section>

        <section id="profile" className="apb-section" aria-labelledby="profile-title">
          <header className="apb-section-head">
            <p className="apb-num">05</p>
            <h2 id="profile-title">A real profile, and a blank one.</h2>
            <p>
              The portable policy says <i>how</i> to decide. A profile says what one person decided. Marco&rsquo;s profile is the working
              example; adopt it only if you mean to, or replace it with yours.
            </p>
          </header>
          <div className="apb-profile">
            <article className="apb-profile-card">
              <p className="apb-layer-tag">profiles/marco · dated 2026-11-08</p>
              <ul className="apb-prefs">
                <li><b>Delegation</b><span>At most four subagents at once unless overridden, and no coordination ceremony that costs more than the work.</span></li>
                <li><b>Effort</b><span>Planners use MAX where supported, otherwise HIGH. Other roles use workload-appropriate effort.</span></li>
                <li><b>Model selection</b><span>Economical models for routine leadership, scouting and execution; stronger models for architecture, synthesis and hard reviews. Access is verified at use time.</span></li>
                <li><b>Review</b><span>Designated reviewer models, with a separate escalation route for independent review. Worker agents are not assumed to be suitable read-only reviewers.</span></li>
                <li><b>Escalation</b><span>Named specialists fail closed when unavailable. No silent model, provider or credential change.</span></li>
              </ul>
              <pre className="apb-yaml" aria-label="Excerpt from profiles/marco/roster.yaml"><code>{`# roster.yaml (excerpt)
max_subagents: 4
planner_effort_preference: [max, high]
fallback_policy: fail_closed_without_explicit_authorization
credential_changes: never_implicit`}</code></pre>
              <p className="apb-fine">
                Concrete model IDs in <code>models.yaml</code> are marked <code>runtime_verified: false</code>: they were observed in a
                source config, not certified as available on any account.
              </p>
              <a className="apb-textlink" href={`${BLOB}/profiles/marco/PROFILE.md`} {...ext}>Read Marco&rsquo;s profile ↗<NewTab /></a>
            </article>

            <article className="apb-profile-card apb-profile-yours">
              <p className="apb-layer-tag">profiles/template · status: not adopted</p>
              <h3>Make it yours.</h3>
              <ol className="apb-steps apb-steps-tight">
                <li>Fork or copy the repository.</li>
                <li>Fill in <code>profiles/template/PROFILE.md</code>, recording only where you differ from the playbook.</li>
                <li>Remove the placeholders. Keep secrets and day-to-day availability out.</li>
                <li>Point your assistant at your fork with the same prompts above.</li>
              </ol>
              <p className="apb-fields-label">The template asks for</p>
              <ul className="apb-fields">
                {templateFields.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <a className="apb-textlink" href={`${BLOB}/profiles/template/PROFILE.md`} {...ext}>Open the template ↗<NewTab /></a>
            </article>
          </div>
        </section>

        <section id="limits" className="apb-section" aria-labelledby="limits-title">
          <header className="apb-section-head">
            <p className="apb-num">06</p>
            <h2 id="limits-title">What it does not do.</h2>
          </header>
          <ul className="apb-limits">
            <li><b>No memory sync.</b> Nothing updates your assistant&rsquo;s memory automatically, now or when the repository changes.</li>
            <li><b>No installer.</b> Skills are copied by your agent after you consent, using your harness&rsquo;s own discovery.</li>
            <li><b>No runtime.</b> It is documents. It does not dispatch agents, provision providers or hold credentials.</li>
            <li><b>No performance claim.</b> It records operating conventions; it has not been benchmarked against working without it.</li>
            <li><b>No universal model ranking.</b> Model preferences are one person&rsquo;s dated choices, to verify locally before use.</li>
          </ul>
        </section>

        <section className="apb-pair" aria-labelledby="pair-title">
          <div>
            <p className="apb-path-label"><span aria-hidden="true">◇</span> Companion reading</p>
            <h2 id="pair-title">The guide teaches the decision. The playbook remembers yours.</h2>
            <p>
              The Orchestration Guide asks how much coordination a piece of work actually needs, from one agent to a human at the wheel.
              The playbook is where you write down how you answered.
            </p>
          </div>
          <div className="apb-pair-actions">
            <Link className="apb-btn apb-btn-read" href="/research/orchestration-guide">Read the Orchestration Guide <span aria-hidden="true">→</span></Link>
            <a className="apb-textlink" href={REPO} {...ext}>gaia-research/agent-playbook ↗<NewTab /></a>
          </div>
        </section>

        <p className="apb-source">
          Source checked: <a href={`${REPO}/tree/${SOURCE_REV}`} {...ext}>agent-playbook @ {SOURCE_REV}<NewTab /></a> (main).
          The repository is canonical; where this page and it disagree, the repository wins.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
