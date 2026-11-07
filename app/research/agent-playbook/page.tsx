import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import CopyPrompt from "@/components/CopyPrompt";
import PlaybookWalkthrough from "@/components/PlaybookWalkthrough";
import PlaybookContinuity from "@/components/PlaybookContinuity";
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
    description:
      "Your agent shouldn't have to rediscover how you want it to work. Plain documents, two optional skills, one swappable profile.",
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
    answer: "Preview, push, merge, and deploy are distinct permissions. Approving a preview never authorizes a merge.",
    src: "PLAYBOOK.md · Authority",
  },
  {
    ask: "The requested model is unavailable. Use another?",
    answer: "Never downgrade silently. A missing model or altered billing route requires a visible diagnostic and your choice.",
    src: "skills/orchestrate",
  },
  {
    ask: "Should I fan this out to five subagents?",
    answer: "Only when independent lanes beat coordination tax, with concurrency and budget bounded before dispatch.",
    src: "PLAYBOOK.md · Intent, evidence, and cost",
  },
  {
    ask: "How do I report that the task is done?",
    answer: "Separate what ran, passed, and was skipped—unknown is never passed—and close with the four-line receipt.",
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
            <p className="apb-kicker">
              <Link href="/research">Research</Link> <span aria-hidden="true">/</span> Agent Playbook
            </p>
            <h1 id="apb-title">
              Stop <span className="apb-nowrap">re-explaining</span> yourself to every new agent.
            </h1>
            <PlaybookContinuity items={continuity.map(({ ask, src }) => ({ ask, src }))} />
            <p className="apb-lede">
              Every fresh session begins with a quiet tax: untangling whether &ldquo;done&rdquo; means merged or merely
              pushed, whether a missing model may silently downgrade, and when five subagents are worse than one. The
              Agent Playbook writes those answers down once—a portable operating philosophy you can feed to any
              assistant as context, or adopt as consented skills in a coding harness.
            </p>
            <div className="apb-hero-actions">
              <a className="apb-btn apb-btn-read" href="#memory">
                Read as memory <span aria-hidden="true">↓</span>
              </a>
              <a className="apb-btn apb-btn-install" href="#skills">
                Install optional skills <span aria-hidden="true">↓</span>
              </a>
              <a className="apb-textlink" href={REPO} {...ext}>
                View on GitHub ↗<NewTab />
              </a>
            </div>
            <p className="apb-meta">MIT licensed · plain Markdown &amp; YAML · no runtime, no installer, no account</p>
          </div>

          <figure className="apb-map" aria-labelledby="apb-map-cap">
            <figcaption id="apb-map-cap">
              <span>agent-playbook/</span>
              <span>repository anatomy</span>
            </figcaption>
            <ul>
              <li className="apb-map-l1">
                <a href={`${BLOB}/MEMORY.md`} {...ext}>
                  MEMORY.md<NewTab />
                </a>
                <span>conversational entry</span>
                <b>Layer 1</b>
              </li>
              <li className="apb-map-l1">
                <a href={`${BLOB}/PLAYBOOK.md`} {...ext}>
                  PLAYBOOK.md<NewTab />
                </a>
                <span>canonical policy</span>
                <b>Layer 1</b>
              </li>
              <li className="apb-map-dir">skills/</li>
              <li className="apb-map-l2 apb-map-sub">
                <a href={`${BLOB}/skills/orchestrate/SKILL.md`} {...ext}>
                  orchestrate/<NewTab />
                </a>
                <span>route &amp; bound work</span>
                <b>Layer 2</b>
              </li>
              <li className="apb-map-l2 apb-map-sub">
                <a href={`${BLOB}/skills/prompting/SKILL.md`} {...ext}>
                  prompting/<NewTab />
                </a>
                <span>compact briefs</span>
                <b>Layer 2</b>
              </li>
              <li className="apb-map-dir">profiles/</li>
              <li className="apb-map-l3 apb-map-sub">
                <a href={`${TREE}/profiles/marco`} {...ext}>
                  marco/<NewTab />
                </a>
                <span>dated operator example</span>
                <b>Layer 3</b>
              </li>
              <li className="apb-map-l3 apb-map-sub">
                <a href={`${BLOB}/profiles/template/PROFILE.md`} {...ext}>
                  template/<NewTab />
                </a>
                <span>blank slate for yours</span>
                <b>Layer 3</b>
              </li>
              <li className="apb-map-dir">
                <a href={`${TREE}/examples`} {...ext}>
                  examples/<NewTab />
                </a>
                <span>task &amp; review briefs</span>
              </li>
            </ul>
          </figure>
        </section>

        <nav className="apb-toc" aria-label="On this page">
          <a href="#why">Why it exists</a>
          <a href="#layers">Mental model &amp; walkthrough</a>
          <a href="#memory">Read as memory</a>
          <a href="#skills">Install skills</a>
          <a href="#profile">Personal profile</a>
          <a href="#limits">Hard limits</a>
        </nav>

        <section id="why" className="apb-section" aria-labelledby="why-title">
          <header className="apb-section-head">
            <p className="apb-num">01</p>
            <h2 id="why-title">Four questions you shouldn&rsquo;t answer twice.</h2>
            <p>
              A blank context window remembers none of your standards. Without a shared text, the agent either
              interrupts for routine policy or guesses with your authority.
            </p>
          </header>

          <ol className="apb-continuity">
            {continuity.map((row) => (
              <li key={row.ask}>
                <p className="apb-ask">
                  <span>Unguided session</span>
                  {row.ask}
                </p>
                <p className="apb-answer">
                  <span>Playbook standard</span>
                  {row.answer}
                  <small>{row.src}</small>
                </p>
              </li>
            ))}
          </ol>

          <div className="apb-receipt">
            <div>
              <h3>One finish line across every harness.</h3>
              <p>
                Authorized GitHub work closes with a pushed branch, a PR, a committed handoff report, and this exact
                receipt. <i>READY FOR REVIEW</i> means delivered for inspection—never approved, merged, or deployed.
              </p>
            </div>
            <pre aria-label="The playbook's four-line delivery receipt">
              <code>{RECEIPT}</code>
            </pre>
          </div>

          <details className="apb-disclosure">
            <summary>
              <span>How the Agent Playbook differs from a prompt template</span>
              <small>5 architectural distinctions</small>
            </summary>
            <div className="apb-table">
              <table data-stack="true">
                <caption className="sr-only">How the Agent Playbook differs from a prompt template</caption>
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="sr-only">Aspect</span>
                    </th>
                    <th scope="col">Prompt template</th>
                    <th scope="col">Agent Playbook</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Covers</th>
                    <td data-label="Prompt template">The phrasing of a single task</td>
                    <td data-label="Agent Playbook">How work is directed, verified, and handed off across tasks</td>
                  </tr>
                  <tr>
                    <th scope="row">Lives in</th>
                    <td data-label="Prompt template">A snippet you re-paste</td>
                    <td data-label="Agent Playbook">A versioned git repository with reviewed diffs</td>
                  </tr>
                  <tr>
                    <th scope="row">Authority</th>
                    <td data-label="Prompt template">Usually implicit</td>
                    <td data-label="Agent Playbook">Explicit precedence: current instruction → repo rules → adopted profile → defaults</td>
                  </tr>
                  <tr>
                    <th scope="row">Personal choices</th>
                    <td data-label="Prompt template">Hardcoded into the prompt</td>
                    <td data-label="Agent Playbook">Isolated in a profile you can swap without touching the skills</td>
                  </tr>
                  <tr>
                    <th scope="row">Updates</th>
                    <td data-label="Prompt template">Manual copy-paste drift</td>
                    <td data-label="Agent Playbook">Inspectable commits; memory updates only when you re-approve</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>
        </section>

        <section id="layers" className="apb-section" aria-labelledby="layers-title">
          <header className="apb-section-head">
            <p className="apb-num">02</p>
            <h2 id="layers-title">Three layers, adopted separately.</h2>
            <p>
              Take one layer or all three. Reading context never installs a skill; installing a skill never adopts
              someone else&rsquo;s profile.
            </p>
          </header>

          <div className="apb-layers">
            <article className="apb-layer apb-layer-1">
              <p className="apb-layer-tag">Layer 1 · Memory &amp; context</p>
              <h3>Read by any assistant.</h3>
              <p>
                <code>MEMORY.md</code> is distilled for ingestion; <code>PLAYBOOK.md</code> holds the full policy. Your
                assistant proposes entries and saves only what you approve.
              </p>
              <a href="#memory">Path A: Read it in →</a>
            </article>
            <article className="apb-layer apb-layer-2">
              <p className="apb-layer-tag">Layer 2 · Optional skills</p>
              <h3>Two consented coding skills.</h3>
              <p>
                <code>orchestrate</code> bounds delegation and handoffs; <code>prompting</code> shapes compact,
                falsifiable briefs. Neither requires Pi or private infrastructure.
              </p>
              <a href="#skills">Path B: Install with consent →</a>
            </article>
            <article className="apb-layer apb-layer-3">
              <p className="apb-layer-tag">Layer 3 · Personal configuration</p>
              <h3>Your convictions, kept apart.</h3>
              <p>
                Model roles, concurrency caps, and effort live in a replaceable profile. Marco&rsquo;s is a dated
                example; the template is yours to fill in.
              </p>
              <a href="#profile">See profile &amp; template →</a>
            </article>
          </div>

          <PlaybookWalkthrough />
        </section>

        <section id="memory" className="apb-section apb-path apb-path-read" aria-labelledby="memory-title">
          <header className="apb-section-head">
            <p className="apb-num">03</p>
            <p className="apb-path-label">
              <span aria-hidden="true">◇</span> Path A · Read as memory · no installation
            </p>
            <h2 id="memory-title">Feed a chat assistant the operating context.</h2>
            <p>
              For ChatGPT, Claude, or any conversational AI. This is not an automatic memory importer: the assistant
              reads the documents, proposes dated entries, and saves only what you approve.
            </p>
          </header>
          <div className="apb-path-grid">
            <ol className="apb-steps">
              <li>
                <b>Start a conversation</b> with an assistant that can fetch URLs—or paste{" "}
                <a href={`${RAW}/MEMORY.md`} {...ext}>
                  MEMORY.md (raw)<NewTab />
                </a>{" "}
                and{" "}
                <a href={`${RAW}/PLAYBOOK.md`} {...ext}>
                  PLAYBOOK.md (raw)<NewTab />
                </a>{" "}
                directly.
              </li>
              <li>
                <b>Run the prompt.</b> It requests a short summary and proposed memory entries while withholding{" "}
                <code>profiles/marco</code> unless you ask.
              </li>
              <li>
                <b>Approve line by line.</b> Keep live model availability, prices, credentials, and private endpoints
                out of saved memory.
              </li>
              <li>
                <b>Verify what persisted.</b> Where platform memory is unavailable, the rules still govern the active
                chat and can be saved as plain text.
              </li>
            </ol>
            <CopyPrompt id="memory-prompt" label="Prompt for a chat assistant" text={MEMORY_PROMPT} />
          </div>
          <p className="apb-note">
            Remembering these principles grants zero permission to install skills, run commands, alter credentials, or
            deploy. Repository edits never auto-sync; re-run the review when adopting a newer revision.
          </p>
        </section>

        <section id="skills" className="apb-section apb-path apb-path-install" aria-labelledby="skills-title">
          <header className="apb-section-head">
            <p className="apb-num">04</p>
            <p className="apb-path-label">
              <span aria-hidden="true">◆</span> Path B · Install optional skills · requires your consent
            </p>
            <h2 id="skills-title">Have your coding agent propose a copy plan.</h2>
            <p>
              There is no one-line installer, by design. Each skill is a plain <code>SKILL.md</code> folder; your agent
              checks how your harness discovers skills, shows a copy plan, and writes nothing until you agree.
            </p>
          </header>
          <div className="apb-path-grid">
            <div>
              <ol className="apb-steps">
                <li>
                  <b>Select</b> <code>orchestrate</code>, <code>prompting</code>, or both, and choose project or user
                  scope.
                </li>
                <li>
                  <b>Inspect.</b> The agent checks current harness docs and existing skill folders, then reports paths
                  and any file collisions.
                </li>
                <li>
                  <b>Consent.</b> Nothing is copied before your explicit yes—no hooks, extensions, or dependencies.
                </li>
                <li>
                  <b>Verify.</b> The agent confirms discovery and rolls back only its own files if verification fails.
                </li>
              </ol>

              <details className="apb-disclosure apb-harness-disclosure">
                <summary>
                  <span>Documented harness discovery paths (Claude Code, Codex, Pi)</span>
                  <small>Checked 2026-11-08</small>
                </summary>
                <div className="apb-table apb-harness">
                  <table data-stack="true">
                    <caption>Documented discovery locations from the repository&rsquo;s harness notes</caption>
                    <thead>
                      <tr>
                        <th scope="col">Harness</th>
                        <th scope="col">Project</th>
                        <th scope="col">User</th>
                      </tr>
                    </thead>
                    <tbody>
                      {harnesses.map(([name, project, user, docs]) => (
                        <tr key={name}>
                          <th scope="row">
                            <a href={docs} {...ext}>
                              {name} ↗<NewTab />
                            </a>
                          </th>
                          <td data-label="Project">
                            <code>{project}</code>
                          </td>
                          <td data-label="User">
                            <code>{user}</code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="apb-fine">
                  Sourced from official harness docs (read 2026-11-08); no live installation was tested in the
                  repository. Managed policies and cloud sessions may differ—have your agent confirm against current
                  docs.
                </p>
              </details>
            </div>
            <CopyPrompt id="skills-prompt" label="Prompt for a coding agent" text={SKILLS_PROMPT} />
          </div>
          <p className="apb-note">
            Installing a skill grants a procedure, not authority. The <code>orchestrate</code> skill explicitly forbids
            installing integrations or widening merge/deployment permissions merely to finish a task.
          </p>
        </section>

        <section id="profile" className="apb-section" aria-labelledby="profile-title">
          <header className="apb-section-head">
            <p className="apb-num">05</p>
            <h2 id="profile-title">Policy vs. conviction: a real profile and a blank one.</h2>
            <p>
              The portable policy states <i>how</i> to decide; a profile records what one operator actually decided.
              Marco&rsquo;s profile is a working example—adopt it only by choice, or replace it with your own.
            </p>
          </header>
          <div className="apb-profile">
            <article className="apb-profile-card">
              <p className="apb-layer-tag">profiles/marco · dated 2026-11-08</p>
              <ul className="apb-prefs">
                <li>
                  <b>Delegation</b>
                  <span>Max four concurrent subagents unless overridden; no ceremony that costs more than the task.</span>
                </li>
                <li>
                  <b>Effort</b>
                  <span>Planners request MAX (falling back to HIGH); other roles match effort to workload.</span>
                </li>
                <li>
                  <b>Model roles</b>
                  <span>Economical models for scouting and routine execution; stronger models for architecture and review.</span>
                </li>
                <li>
                  <b>Review</b>
                  <span>Dedicated read-only reviewers with an independent escalation route; workers are not assumed reviewers.</span>
                </li>
                <li>
                  <b>Escalation</b>
                  <span>Named specialists fail closed when unavailable—no silent model, provider, or credential swap.</span>
                </li>
              </ul>
              <pre className="apb-yaml" aria-label="Excerpt from profiles/marco/roster.yaml">
                <code>{`# roster.yaml (excerpt)
max_subagents: 4
planner_effort_preference: [max, high]
fallback_policy: fail_closed_without_explicit_authorization
credential_changes: never_implicit`}</code>
              </pre>
              <p className="apb-fine">
                Concrete model IDs in <code>models.yaml</code> carry <code>runtime_verified: false</code>—observed in a
                source config, not certified as live on any account.
              </p>
              <a className="apb-textlink" href={`${BLOB}/profiles/marco/PROFILE.md`} {...ext}>
                Read Marco&rsquo;s profile ↗<NewTab />
              </a>
            </article>

            <article className="apb-profile-card apb-profile-yours">
              <p className="apb-layer-tag">profiles/template · status: not adopted</p>
              <h3>Make it yours.</h3>
              <ol className="apb-steps apb-steps-tight">
                <li>Fork or copy the repository.</li>
                <li>
                  Edit <code>profiles/template/PROFILE.md</code>, recording only where your rules differ from the
                  playbook.
                </li>
                <li>Strip placeholders; keep secrets, tokens, and day-to-day availability out.</li>
                <li>Point your assistant at your fork using the prompts above.</li>
              </ol>
              <p className="apb-fields-label">Template sections</p>
              <ul className="apb-fields">
                {templateFields.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <a className="apb-textlink" href={`${BLOB}/profiles/template/PROFILE.md`} {...ext}>
                Open the template ↗<NewTab />
              </a>
            </article>
          </div>
        </section>

        <section id="limits" className="apb-section" aria-labelledby="limits-title">
          <header className="apb-section-head">
            <p className="apb-num">06</p>
            <h2 id="limits-title">What it refuses to do.</h2>
          </header>
          <ul className="apb-limits">
            <li>
              <b>No memory sync.</b> Nothing updates your assistant&rsquo;s memory automatically, now or on future commits.
            </li>
            <li>
              <b>No installer.</b> Skills are copied by your agent only after consent, using native harness discovery.
            </li>
            <li>
              <b>No runtime.</b> Plain documents only—it never dispatches agents, provisions keys, or stores secrets.
            </li>
            <li>
              <b>No performance claim.</b> Records operating conventions; not benchmarked against unguided baselines.
            </li>
            <li>
              <b>No universal ranking.</b> Model preferences reflect one operator&rsquo;s dated setup; verify locally.
            </li>
          </ul>
        </section>

        <section className="apb-pair" aria-labelledby="pair-title">
          <div>
            <p className="apb-path-label">
              <span aria-hidden="true">◇</span> Companion reading
            </p>
            <h2 id="pair-title">The guide teaches the decision. The playbook remembers yours.</h2>
            <p>
              The Orchestration Guide measures how much coordination a task actually earns, from one warm agent to a
              human at the wheel. The Playbook is where your chosen rules live.
            </p>
          </div>
          <div className="apb-pair-actions">
            <Link className="apb-btn apb-btn-read" href="/research/orchestration-guide">
              Read the Orchestration Guide <span aria-hidden="true">→</span>
            </Link>
            <a className="apb-textlink" href={REPO} {...ext}>
              gaia-research/agent-playbook ↗<NewTab />
            </a>
          </div>
        </section>

        <p className="apb-source">
          Source checked:{" "}
          <a href={`${REPO}/tree/${SOURCE_REV}`} {...ext}>
            agent-playbook @ {SOURCE_REV}
            <NewTab />
          </a>{" "}
          (main). The repository is canonical; where this page and it disagree, the repository wins.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
