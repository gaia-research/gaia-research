"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import CopyCommand from "@/components/CopyCommand";

const PLUGIN_INSTALL_CMD = "claude plugin install skill-heaven@gaia-skill-heaven";
const LAUNCHER_INSTALL_CMD = "curl -fsSL https://gaia-research.github.io/gaia-skill-heaven/install.sh | sh";
const SKILL_HEAVEN_URL = "https://gaia-research.github.io/gaia-skill-heaven/";

export default function McpPage() {
  const [activeTab, setActiveTab] = useState<"claude-plugin" | "launcher" | "manual-mcp">("claude-plugin");

  return (
    <>
      <SiteHeader />
      <main id="main" className="mcp-page">
        {/* ── Decommission / Deprecation Banner ──────────────────────────── */}
        <section className="mcp-banner-section section-shell" aria-label="Deprecation notice">
          <div className="mcp-decommission-banner">
            <div className="mcp-banner-badge">
              <span className="mcp-banner-icon" aria-hidden="true">⚠️</span>
              <span>DECOMMISSION NOTICE · 2026-08-19</span>
            </div>
            <div className="mcp-banner-content">
              <h3>Standalone Gaia MCP and NPX are Decommissioned</h3>
              <p>
                The standalone npm packages (<code>@gaia-research/mcp</code> and <code>skill-hell</code>) were
                officially deprecated on npm. The MCP summon capability is now <strong>bundled natively</strong> into
                the unified <strong>Skill Heaven Agent Plugin</strong> &mdash; zero npx downloads, zero background daemon debt,
                and no external binaries required.
              </p>
              <div className="mcp-banner-action">
                <a className="button primary" href={SKILL_HEAVEN_URL} target="_blank" rel="noreferrer">
                  Read the Migration Guide <span>↗</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="mcp-hero section-shell" aria-labelledby="mcp-title">
          <div className="mcp-hero-inner">
            <div className="mcp-hero-copy">
              <p className="signal">
                <span /> SKILL HEAVEN RUNTIME UMBRELLA
              </p>
              <h1 id="mcp-title">
                Stop Installing MCPs. <br />
                Start <em>Summoning</em>.
              </h1>
              <p className="mcp-hero-lede">
                The Gaia Skill Tree now connects directly to your agent via the <strong>Skill Heaven Agent Plugin</strong>,
                which packages its own summon MCP server. Summon capabilities into ephemeral session context on demand &mdash;
                with zero diffs on disk and zero ambient skill debt.
              </p>
              <div className="mcp-badges">
                <span className="chip act">PLUGIN RELEASED</span>
                <span className="mcp-version-badge">skill-heaven@gaia-skill-heaven</span>
              </div>
              <div className="mcp-hero-install">
                <CopyCommand command={PLUGIN_INSTALL_CMD} />
              </div>
            </div>

            <div className="mcp-hero-diagram" aria-hidden="true">
              <div className="mcp-diagram">
                <div className="mcp-node mcp-node-editor">
                  <span className="mcp-node-label">YOUR AGENT</span>
                  <div className="mcp-node-chips">
                    <span>Claude Code</span>
                    <span>pi</span>
                    <span>Codex</span>
                  </div>
                </div>
                <div className="mcp-wire">
                  <span className="mcp-wire-label">/summon</span>
                  <div className="mcp-wire-line" />
                </div>
                <div className="mcp-node mcp-node-server">
                  <span className="mcp-node-label">SKILL HEAVEN PLUGIN</span>
                  <code className="mcp-node-pkg">bundled stdio MCP</code>
                </div>
                <div className="mcp-wire">
                  <div className="mcp-wire-line" />
                </div>
                <div className="mcp-node mcp-node-tree">
                  <span className="mcp-node-label">GAIA REGISTRY</span>
                  <span className="mcp-node-sub">gaiaskilltree.com</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Architecture Evolution: Standalone vs Plugin ─────────────── */}
        <section className="mcp-comparison section-shell" aria-labelledby="comp-title">
          <h2 id="comp-title">The Evolution: From Standalone MCP to Bundled Plugin</h2>
          <p className="mcp-sublede">
            Why we moved from ambient daemon configuration to session-locked capability summoning.
          </p>

          <div className="mcp-comp-grid">
            <article className="mcp-comp-card mcp-comp-old">
              <div className="mcp-comp-badge">DECOMMISSIONED</div>
              <h3>Standalone NPX Package</h3>
              <p className="mcp-comp-sub"><code>@gaia-research/mcp</code> (Legacy)</p>
              <ul>
                <li>❌ Required standalone <code>npx</code> process execution on every invocation.</li>
                <li>❌ Global editor config mutation; persisted background daemon state.</li>
                <li>❌ Broad 4-tool surface exposed ambient complexity.</li>
                <li>❌ Prone to npm registry downtime and version drift.</li>
              </ul>
            </article>

            <article className="mcp-comp-card mcp-comp-new">
              <div className="mcp-comp-badge is-active">CURRENT · RECOMMENDED</div>
              <h3>Skill Heaven Agent Plugin</h3>
              <p className="mcp-comp-sub"><code>skill-heaven@gaia-skill-heaven</code></p>
              <ul>
                <li>✅ <strong>Self-contained:</strong> Bundles its own MCP server &mdash; no external binary needed.</li>
                <li>✅ <strong>Zero install debt:</strong> Skills enter context on demand for one session only.</li>
                <li>✅ <strong>Single mechanic:</strong> Focused on <code>/summon</code> with 0 repository diffs.</li>
                <li>✅ <strong>Entropy control:</strong> Full access to Skill Zero, Heaven, Hell, and Ultra.</li>
              </ul>
            </article>
          </div>
        </section>

        {/* ── Installation Options ──────────────────────────────────────── */}
        <section className="mcp-integration section-shell" aria-labelledby="install-guide-title">
          <h2 id="install-guide-title">How to Install Skill Heaven</h2>
          <p className="mcp-integration-lede">
            Choose the installation method suited for your workflow:
          </p>

          <div className="mcp-tabs" role="tablist" aria-label="Installation methods">
            <button
              role="tab"
              aria-selected={activeTab === "claude-plugin"}
              className={`mcp-tab${activeTab === "claude-plugin" ? " mcp-tab-active" : ""}`}
              onClick={() => setActiveTab("claude-plugin")}
            >
              Claude Code Plugin (Recommended)
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "launcher"}
              className={`mcp-tab${activeTab === "launcher" ? " mcp-tab-active" : ""}`}
              onClick={() => setActiveTab("launcher")}
            >
              Standalone *-zero Launchers
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "manual-mcp"}
              className={`mcp-tab${activeTab === "manual-mcp" ? " mcp-tab-active" : ""}`}
              onClick={() => setActiveTab("manual-mcp")}
            >
              Custom MCP Client
            </button>
          </div>

          <div className="mcp-tab-panel" role="tabpanel">
            {activeTab === "claude-plugin" && (
              <div className="mcp-panel-content">
                <p className="mcp-panel-desc">
                  Installs Skill Heaven directly into Claude Code. This automatically sets up the bundled summon MCP server.
                </p>
                <div className="mcp-snippet-wrap">
                  <pre className="mcp-snippet">
                    <code>{PLUGIN_INSTALL_CMD}</code>
                  </pre>
                  <CopyCommand className="mcp-snippet-copy" command={PLUGIN_INSTALL_CMD} />
                </div>
                <p className="mcp-panel-note">
                  Once installed, type <code>/summon "topic"</code> in any Claude Code session to pull verified capabilities into context.
                </p>
              </div>
            )}

            {activeTab === "launcher" && (
              <div className="mcp-panel-content">
                <p className="mcp-panel-desc">
                  Installs the five clean launcher doors (<code>claude-zero</code>, <code>pi-zero</code>, <code>codex-zero</code>, <code>hermes-zero</code>, <code>grok-zero</code>).
                </p>
                <div className="mcp-snippet-wrap">
                  <pre className="mcp-snippet">
                    <code>{LAUNCHER_INSTALL_CMD}</code>
                  </pre>
                  <CopyCommand className="mcp-snippet-copy" command={LAUNCHER_INSTALL_CMD} />
                </div>
                <p className="mcp-panel-note">
                  Windows PowerShell: <code>irm https://gaia-research.github.io/gaia-skill-heaven/install.ps1 | iex</code>
                </p>
              </div>
            )}

            {activeTab === "manual-mcp" && (
              <div className="mcp-panel-content">
                <p className="mcp-panel-desc">
                  If connecting a custom MCP harness to Skill Heaven's bundled server:
                </p>
                <div className="mcp-snippet-wrap">
                  <pre className="mcp-snippet">
                    <code>{`{
  "mcpServers": {
    "skill-heaven": {
      "command": "node",
      "args": ["<path-to-skill-heaven>/packages/skill-summon/bin/skill-summon.mjs"]
    }
  }
}`}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className="mcp-cta section-shell" aria-labelledby="mcp-cta-title">
          <div className="mcp-cta-inner">
            <div>
              <p className="signal">
                <span /> ONE HOUSE, THREE ROOMS
              </p>
              <h2 id="mcp-cta-title">Explore the Gaia Ecosystem.</h2>
              <p>
                Research proves it, the registry records it, the launcher runs it. Visit Skill Heaven for full documentation and door options.
              </p>
            </div>
            <div className="mcp-cta-actions">
              <a
                className="button primary"
                href={SKILL_HEAVEN_URL}
                target="_blank"
                rel="noreferrer"
              >
                Visit Skill Heaven <span>↗</span>
              </a>
              <Link className="button secondary" href="/about">
                Read About Gaia <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        <style>{`
          .mcp-page{padding-bottom:var(--space-loose)}
          .mcp-banner-section{padding:var(--space-dense) var(--gutter) 0}
          .mcp-decommission-banner{
            border: 1px solid rgba(251, 191, 36, 0.4);
            background: linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(251, 191, 36, 0.02));
            padding: clamp(1.2rem, 3vw, 1.8rem);
            border-radius: 4px;
            margin-bottom: 1.5rem;
          }
          .mcp-banner-badge{
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font: var(--type-compact) var(--mono);
            font-size: 0.8rem;
            letter-spacing: 0.1em;
            color: #fbbf24;
            margin-bottom: 0.75rem;
          }
          .mcp-banner-content h3{
            font-family: var(--display);
            font-size: clamp(1.4rem, 2.5vw, 1.85rem);
            letter-spacing: 0.02em;
            margin: 0 0 0.5rem;
            color: var(--ink);
          }
          .mcp-banner-content p{
            color: var(--muted);
            line-height: 1.6;
            max-width: 72ch;
            margin: 0 0 1rem;
          }
          .mcp-banner-content code{
            color: #fbbf24;
            background: rgba(251, 191, 36, 0.1);
            padding: 0.15rem 0.35rem;
            border-radius: 2px;
          }
          .mcp-hero{padding:var(--space-dense) var(--gutter) var(--space-loose)}
          .mcp-hero-inner{display:grid;grid-template-columns:1fr 1fr;gap:clamp(2rem,5vw,4rem);align-items:center}
          .mcp-hero-copy h1{font-size:clamp(2.5rem,5vw,4rem);margin:.5rem 0 1rem;line-height:1.05}
          .mcp-hero-lede{font-size:1.125rem;line-height:1.6;color:var(--muted);margin-bottom:1.5rem;max-width:52ch}
          .mcp-badges{display:flex;align-items:center;gap:.75rem;margin-bottom:1.5rem}
          .mcp-version-badge{font:var(--type-compact) var(--mono);color:var(--dim);border:1px solid var(--line);padding:.25rem .6rem}
          .mcp-hero-install{max-width:480px}
          .mcp-diagram{display:flex;align-items:center;justify-content:center;gap:.75rem;padding:2rem;background:rgba(11,12,19,.9);border:1px solid var(--line)}
          .mcp-node{display:flex;flex-direction:column;gap:.4rem;padding:1rem;background:var(--surface);border:1px solid var(--line);min-width:110px;text-align:center}
          .mcp-node-label{font:var(--type-compact) var(--mono);font-size:.7rem;letter-spacing:.08em;color:var(--dim)}
          .mcp-node-chips{display:flex;flex-direction:column;gap:.25rem;font-size:.75rem;color:var(--muted)}
          .mcp-node-pkg{font:var(--type-compact) var(--mono);font-size:.75rem;color:var(--pink)}
          .mcp-node-sub{font-size:.75rem;color:var(--dim)}
          .mcp-wire{display:flex;flex-direction:column;align-items:center;gap:.25rem;flex:1}
          .mcp-wire-label{font:var(--type-compact) var(--mono);font-size:.65rem;color:var(--dim);letter-spacing:.06em}
          .mcp-wire-line{height:1px;width:100%;background:linear-gradient(90deg,var(--line),var(--blue),var(--line))}
          .mcp-comparison{padding:var(--space-dense) var(--gutter)}
          .mcp-sublede{color:var(--muted);margin:0 0 2rem;max-width:64ch}
          .mcp-comp-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}
          .mcp-comp-card{padding:1.5rem;border:1px solid var(--line);background:rgba(11,12,19,.8)}
          .mcp-comp-old{border-color:rgba(239, 68, 68, 0.3);background:rgba(239, 68, 68, 0.02)}
          .mcp-comp-new{border-color:rgba(192, 132, 252, 0.4);background:rgba(192, 132, 252, 0.03)}
          .mcp-comp-badge{display:inline-block;font:var(--type-compact) var(--mono);font-size:.7rem;letter-spacing:.08em;padding:.2rem .5rem;border:1px solid rgba(239, 68, 68, 0.5);color:#ef4444;margin-bottom:1rem}
          .mcp-comp-badge.is-active{border-color:rgba(192, 132, 252, 0.6);color:#c084fc}
          .mcp-comp-card h3{font-family:var(--display);font-size:1.4rem;margin:0 0 .25rem;color:var(--ink)}
          .mcp-comp-sub{margin:0 0 1rem;font-size:.85rem;color:var(--dim)}
          .mcp-comp-card ul{list-style:none;padding:0;margin:0;display:grid;gap:.6rem;color:var(--muted);font-size:.9rem;line-height:1.5}
          .mcp-integration{padding:var(--space-dense) var(--gutter)}
          .mcp-integration-lede{color:var(--muted);margin:0 0 1.5rem;max-width:64ch}
          .mcp-tabs{display:flex;gap:.5rem;border-bottom:1px solid var(--line);margin-bottom:1.5rem;overflow-x:auto}
          .mcp-tab{background:none;border:none;border-bottom:2px solid transparent;padding:.6rem 1rem;font:var(--type-compact) var(--mono);font-size:.85rem;color:var(--dim);cursor:pointer;white-space:nowrap}
          .mcp-tab:hover{color:var(--ink)}
          .mcp-tab-active{color:var(--blue);border-bottom-color:var(--blue)}
          .mcp-tab-panel{background:rgba(11,12,19,.9);border:1px solid var(--line);padding:1.5rem}
          .mcp-panel-desc{color:var(--muted);margin:0 0 1rem;font-size:.95rem}
          .mcp-panel-note{color:var(--dim);margin:1rem 0 0;font-size:.85rem}
          .mcp-snippet-wrap{position:relative}
          .mcp-snippet{background:var(--bg);border:1px solid var(--line);padding:1rem;font-family:var(--mono);font-size:.85rem;color:var(--ink);overflow-x:auto;margin:0}
          .mcp-cta{padding:var(--space-dense) var(--gutter) var(--space-loose)}
          .mcp-cta-inner{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:2rem;padding:2rem;background:rgba(11,12,19,.9);border:1px solid var(--line)}
          .mcp-cta-inner h2{font-size:clamp(1.75rem,3vw,2.5rem);margin:.25rem 0 .5rem}
          .mcp-cta-inner p{color:var(--muted);margin:0;max-width:54ch}
          .mcp-cta-actions{display:flex;gap:1rem;flex-wrap:wrap}
          @media(max-width:800px){
            .mcp-hero-inner{grid-template-columns:1fr}
            .mcp-comp-grid{grid-template-columns:1fr}
          }
        `}</style>
      </main>
      <SiteFooter />
    </>
  );
}
