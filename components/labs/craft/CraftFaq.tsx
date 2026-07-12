/**
 * components/labs/craft/CraftFaq.tsx
 *
 * Compact FAQ accordion for the Infinite Skill Craft lab.
 * Uses native <details>/<summary> for zero-JS accordion behaviour with
 * full accessibility out of the box. Server component (no 'use client').
 *
 * Covers the canonical vocabulary distinctions:
 *   Skill / Plugin / MCP / Tool / Workflow / Gaia Skill Tree
 * — accurate but playful, in Milim voice.
 *
 * Styles: craft-chrome.css (imported from page.tsx)
 */

export function CraftFaq() {
  return (
    <section className="craft-faq" aria-label="Frequently asked questions">
      <div className="craft-faq-head">
        <p className="craft-faq-kicker">Reference</p>
        <h2 className="craft-faq-title">The Skill Briefing</h2>
      </div>

      <ul className="craft-faq-items" role="list">
        {/* ── Q1 ──────────────────────────────────────────────────────────── */}
        <li>
          <details className="craft-faq-item">
            <summary className="craft-faq-q">
              What exactly is a skill?
            </summary>
            <div className="craft-faq-a">
              <p>
                An <strong>agent skill</strong> is a <strong>packaged capability</strong> — a{" "}
                <code>SKILL.md</code> instruction set that gives an AI agent a specific,
                named ability. Think of it as a unit of agent behaviour: a thing the agent
                can <em>do</em>, not a vague concept or noun.
              </p>
              <p>
                Skills follow a progressive-disclosure pattern: the{" "}
                <code>SKILL.md</code> file is the entry point (name, description, how to
                invoke), with deeper reference docs linked inside. A skill&apos;s identity is
                its <strong>slash name</strong> (e.g. <code>/prompt</code>,{" "}
                <code>/code</code>).
              </p>
              <p>
                <strong>Not a skill:</strong> a random object, a vibe, a noun that an AI could
                describe. Skills are verbs dressed as nouns — things agents <em>perform</em>.
              </p>
            </div>
          </details>
        </li>

        {/* ── Q2 ──────────────────────────────────────────────────────────── */}
        <li>
          <details className="craft-faq-item">
            <summary className="craft-faq-q">
              Skill vs. plugin — what&apos;s the difference?
            </summary>
            <div className="craft-faq-a">
              <p>
                A <strong>skill</strong> is a <em>capability spec</em> — it lives in a{" "}
                <code>SKILL.md</code> and tells an agent how to use an ability. It&apos;s
                instruction-first, composable, and verifiable.
              </p>
              <p>
                A <strong>plugin</strong> is a looser code-level extension — typically a
                package or addon that adds functionality to a runtime without necessarily
                defining its own behavioural contract. Plugins can deliver skills, but a plugin
                is not itself a skill.
              </p>
              <p>
                Short version: skill = the spec; plugin = the code that might implement one.
              </p>
            </div>
          </details>
        </li>

        {/* ── Q3 ──────────────────────────────────────────────────────────── */}
        <li>
          <details className="craft-faq-item">
            <summary className="craft-faq-q">
              Skill vs. MCP vs. tool vs. workflow — boss, I&apos;m confused.
            </summary>
            <div className="craft-faq-a">
              <p>
                Fair. Here&apos;s the scout&apos;s vocabulary, lock it in:
              </p>
              <ul className="craft-faq-vocab" role="list">
                <li role="listitem">
                  <strong>Skill</strong>
                  Packaged capability with a{" "}
                  <code>SKILL.md</code> spec. Progressive disclosure. An ability the agent
                  can invoke by name. <em>The atom.</em>
                </li>
                <li role="listitem">
                  <strong>Plugin</strong>
                  Looser code extension. Adds functionality to a runtime. May implement a
                  skill but isn&apos;t a skill itself.
                </li>
                <li role="listitem">
                  <strong>MCP</strong>
                  Model Context Protocol — a <em>protocol</em> (not a skill) for connecting
                  an agent to external data sources, APIs, and context providers. It&apos;s
                  the pipe, not the payload.
                </li>
                <li role="listitem">
                  <strong>Tool</strong>
                  A single callable function exposed to the model (file read, web search,
                  code exec). Atomic, stateless. Skills <em>orchestrate</em> tools.
                </li>
                <li role="listitem">
                  <strong>Workflow</strong>
                  Multi-step orchestration — a sequence or graph of agent actions, possibly
                  composing several skills. Skills are building blocks; workflows are
                  blueprints.
                </li>
              </ul>
              <p>
                Rule of thumb: if it has a{" "}
                <code>SKILL.md</code>, it&apos;s a skill. If it&apos;s a function call in
                code, it&apos;s a tool. If it strings multiple things together, it&apos;s a
                workflow. If it&apos;s a connection protocol, it&apos;s MCP.
              </p>
            </div>
          </details>
        </li>

        {/* ── Q4 ──────────────────────────────────────────────────────────── */}
        <li>
          <details className="craft-faq-item">
            <summary className="craft-faq-q">
              What is the Gaia Skill Tree?
            </summary>
            <div className="craft-faq-a">
              <p>
                The{" "}
                <a href="https://gaiaskilltree.com" target="_blank" rel="noreferrer noopener">
                  Gaia Skill Tree
                </a>{" "}
                is an open registry of verified AI agent skills. Contributors submit skills,
                the community reviews them, and verified skills earn a spot in the canonical
                registry with a stable deep-link and spec page.
              </p>
              <p>
                In this game, <strong>canonical fusions</strong> map to real skills in that
                registry — when you discover one, the result card links straight to the spec.
                The Skill Tree is the source of truth that validates what &ldquo;real skill&rdquo;
                even means here.
              </p>
            </div>
          </details>
        </li>

        {/* ── Q5 ──────────────────────────────────────────────────────────── */}
        <li>
          <details className="craft-faq-item">
            <summary className="craft-faq-q">
              Is my weird fusion actually a real skill?
            </summary>
            <div className="craft-faq-a">
              <p>
                Two possible answers, and both are honest:
              </p>
              <p>
                <span
                  className="craft-faq-tag craft-faq-tag-canon"
                  aria-label="canonical badge"
                >
                  ✦ canonical
                </span>{" "}
                The fusion matched a verified entry in the Gaia Skill Tree registry. That&apos;s
                a <strong>yes, absolutely</strong> — real contributors wrote that spec.
                Click the unlock button to go read it.
              </p>
              <p>
                <span
                  className="craft-faq-tag craft-faq-tag-exp"
                  aria-label="experimental badge"
                >
                  🧪 experimental
                </span>{" "}
                The AI invented this one — it doesn&apos;t exist on the registry yet. Could it
                be a real skill? <strong>You decide, boss.</strong> If the ability is
                genuinely useful, it&apos;s a skill worth writing. If it&apos;s just a clever
                compound noun, it&apos;s a fun combo that lives in your personal inventory.
                The registry accepts contributions — go build it.
              </p>
            </div>
          </details>
        </li>
      </ul>
    </section>
  );
}
