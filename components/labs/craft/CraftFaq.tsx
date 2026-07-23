"use client";
/**
 * components/labs/craft/CraftFaq.tsx
 *
 * Compact FAQ accordion for the Infinite Skill Craft lab.
 * Uses native <details>/<summary> for zero-JS accordion behaviour with
 * full accessibility out of the box.
 *
 * Covers canonical vocabulary distinctions with crisp scannability
 * and tooltip disclosure for secondary details.
 *
 * Styles: craft-chrome.css
 */

import { CraftTooltip } from "./CraftTooltip";

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
                <code>SKILL.md</code> instruction set that gives an AI agent a specific, named ability (e.g. <code>/prompt</code>, <code>/code</code>).
                <CraftTooltip content="Skills use progressive disclosure: the SKILL.md file is the entry point, linking deeper reference docs as needed. They are verbs dressed as nouns — actions agents perform." ariaLabel="Deeper specification details">
                  <span className="craft-tooltip-badge">ⓘ Deeper spec</span>
                </CraftTooltip>
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
                <strong>Skill</strong> = the capability spec (<code>SKILL.md</code> instructions).<br />
                <strong>Plugin</strong> = the code package extending a runtime.
                <CraftTooltip content="A plugin may deliver one or more skills, but the skill itself is the verifiable behavioural spec that agents understand." ariaLabel="Details on skills versus plugins">
                  <span className="craft-tooltip-badge">ⓘ Details</span>
                </CraftTooltip>
              </p>
            </div>
          </details>
        </li>

        {/* ── Q3 ──────────────────────────────────────────────────────────── */}
        <li>
          <details className="craft-faq-item">
            <summary className="craft-faq-q">
              Skill vs. MCP vs. tool vs. workflow — vocabulary check
            </summary>
            <div className="craft-faq-a">
              <ul className="craft-faq-vocab" role="list">
                <li role="listitem">
                  <strong>Skill:</strong> Packaged capability spec (<code>SKILL.md</code>) — the atom.
                </li>
                <li role="listitem">
                  <strong>Tool:</strong> Atomic callable function (file read, web search). Skills orchestrate tools.
                </li>
                <li role="listitem">
                  <strong>Workflow:</strong> Multi-step orchestration sequence of agent actions.
                </li>
                <li role="listitem">
                  <strong>MCP:</strong> Model Context Protocol — the pipe connecting agents to APIs & data.
                </li>
              </ul>
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
                An open registry of verified AI agent skills at{" "}
                <a href="https://gaiaskilltree.com" target="_blank" rel="noreferrer noopener">
                  gaiaskilltree.com
                </a>
                . Canonical fusions ✦ in this lab map straight to live registry specs.
              </p>
            </div>
          </details>
        </li>

        {/* ── Q5 ──────────────────────────────────────────────────────────── */}
        <li>
          <details className="craft-faq-item">
            <summary className="craft-faq-q">
              Is my fusion a real skill?
            </summary>
            <div className="craft-faq-a">
              <p>
                <span className="craft-faq-tag craft-faq-tag-canon">✦ Canonical</span> matches a verified spec in the Gaia Skill Tree.<br />
                <span className="craft-faq-tag craft-faq-tag-exp">🧪 Experimental</span> is an AI-invented combo on the capability frontier.
              </p>
            </div>
          </details>
        </li>
      </ul>
    </section>
  );
}
