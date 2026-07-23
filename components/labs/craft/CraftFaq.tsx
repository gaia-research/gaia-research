"use client";

import { CraftTooltip } from "./CraftTooltip";

export function CraftFaq() {
  return (
    <section className="craft-faq" aria-label="Frequently asked questions">
      <div className="craft-faq-head">
        <p className="craft-faq-kicker">Reference</p>
        <h2 className="craft-faq-title">The Skill Briefing</h2>
      </div>

      <ul className="craft-faq-items" role="list">
        <li>
          <details className="craft-faq-item">
            <summary className="craft-faq-q">What exactly is a skill?</summary>
            <div className="craft-faq-a">
              <p>
                A <CraftTooltip content="A SKILL.md instruction set — verbs dressed as nouns. Actions an agent can perform, tools it wields, or context it understands." ariaLabel="What is an agent skill?"><strong>packaged capability spec</strong></CraftTooltip>{" "}
                (<code>SKILL.md</code>) that gives an AI agent a named ability like <code>/prompt</code> or <code>/code</code>.
              </p>
            </div>
          </details>
        </li>

        <li>
          <details className="craft-faq-item">
            <summary className="craft-faq-q">Skill vs. plugin — what&apos;s the difference?</summary>
            <div className="craft-faq-a">
              <p>
                <strong>Skill</strong> = the capability spec. <strong>Plugin</strong> = the code package that delivers it.
              </p>
            </div>
          </details>
        </li>

        <li>
          <details className="craft-faq-item">
            <summary className="craft-faq-q">Skill vs. tool vs. workflow vs. MCP</summary>
            <div className="craft-faq-a">
              <ul className="craft-faq-vocab" role="list">
                <li><strong>Skill:</strong> named capability spec — the atom.</li>
                <li><strong>Tool:</strong> callable function a skill orchestrates.</li>
                <li><strong>Workflow:</strong> multi-step sequence of agent actions.</li>
                <li><strong>MCP:</strong> the protocol pipe connecting agents to APIs.</li>
              </ul>
            </div>
          </details>
        </li>

        <li>
          <details className="craft-faq-item">
            <summary className="craft-faq-q">What is the Gaia Skill Tree?</summary>
            <div className="craft-faq-a">
              <p>
                Open registry of verified agent skills at{" "}
                <a href="https://gaiaskilltree.com" target="_blank" rel="noreferrer noopener">gaiaskilltree.com</a>.
                {" "}Canonical ✦ fusions link straight to live specs, boss.
              </p>
            </div>
          </details>
        </li>

        <li>
          <details className="craft-faq-item">
            <summary className="craft-faq-q">Is my fusion a real skill?</summary>
            <div className="craft-faq-a">
              <p>
                <span className="craft-faq-tag craft-faq-tag-canon">✦ Canonical</span> = verified in the Gaia Skill Tree.{" "}
                <span className="craft-faq-tag craft-faq-tag-exp">🧪 Experimental</span> = AI-invented frontier combo — you judge, boss.
              </p>
            </div>
          </details>
        </li>
      </ul>
    </section>
  );
}
