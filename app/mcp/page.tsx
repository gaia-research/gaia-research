"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import CopyCommand from "@/components/CopyCommand";
import {
  version,
  packageName,
  packageSelector,
  npmInstallCmd,
  summonNpxCmd,
  scopedSummonNpxCmd,
  availableTools,
  plannedTools,
  integrations,
  type IntegrationId,
} from "@/data/mcp";

export default function McpPage() {
  const [activeTab, setActiveTab] = useState<IntegrationId>("claude-code");
  const activeIntegration = integrations.find((i) => i.id === activeTab)!;

  return (
    <>
      <SiteHeader />
      <main id="main" className="mcp-page">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="mcp-hero section-shell" aria-labelledby="mcp-title">
          <div className="mcp-hero-inner">
            <div className="mcp-hero-copy">
              <p className="signal">
                <span /> MODEL CONTEXT PROTOCOL
              </p>
              <h1 id="mcp-title">
                Gaia <em>MCP</em>
              </h1>
              <p className="mcp-hero-lede">
                The Gaia Skill Tree, wired directly into your editor. Discover, inspect, and
                summon evidence-backed skills over a single stdio connection.
              </p>
              <div className="mcp-badges">
                <span className="chip act">ACT ACTIVE</span>
                <span className="mcp-version-badge">
                  {packageSelector}
                </span>
              </div>
              <div className="mcp-hero-install">
                <CopyCommand command={npmInstallCmd} />
              </div>
            </div>
            <div className="mcp-hero-diagram" aria-hidden="true">
              <div className="mcp-diagram">
                <div className="mcp-node mcp-node-editor">
                  <span className="mcp-node-label">YOUR EDITOR</span>
                  <div className="mcp-node-chips">
                    <span>Claude Code</span>
                    <span>Codex</span>
                    <span>Cursor</span>
                  </div>
                </div>
                <div className="mcp-wire">
                  <span className="mcp-wire-label">stdio / MCP</span>
                  <div className="mcp-wire-line" />
                </div>
                <div className="mcp-node mcp-node-server">
                  <span className="mcp-node-label">GAIA MCP</span>
                  <code className="mcp-node-pkg">{packageName}</code>
                </div>
                <div className="mcp-wire">
                  <div className="mcp-wire-line" />
                </div>
                <div className="mcp-node mcp-node-tree">
                  <span className="mcp-node-label">SKILL TREE</span>
                  <span className="mcp-node-sub">gaiaskilltree.com</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Modes ─────────────────────────────────────────────────────── */}
        <section className="mcp-modes section-shell" aria-labelledby="modes-title">
          <h2 id="modes-title">One released mode. One separate profile.</h2>
          <div className="mcp-modes-grid">
            <article className="mcp-mode-card">
              <header className="mcp-mode-head">
                <span className="mcp-mode-icon" aria-hidden="true">◈</span>
                <h3>Registry Mode</h3>
                <span className="mcp-mode-badge">Active</span>
              </header>
              <p>
                The published server reads the public Gaia Skill Tree registry. No local
                checkout is required; skills are fetched on demand and cached locally.
              </p>
              <dl className="mcp-mode-meta">
                <div>
                  <dt>Source</dt>
                  <dd>gaiaskilltree.com registry API</dd>
                </div>
                <div>
                  <dt>Local files</dt>
                  <dd>None required</dd>
                </div>
                <div>
                  <dt>Best for</dt>
                  <dd>Consuming published skills</dd>
                </div>
              </dl>
            </article>

            <article className="mcp-mode-card mcp-mode-card-profile">
              <header className="mcp-mode-head">
                <span className="mcp-mode-icon" aria-hidden="true">⬡</span>
                <h3>Heaven / Summon profile</h3>
                <span className="mcp-mode-badge mcp-mode-badge-profile">Separate</span>
              </header>
              <p>
                The thin two-tool profile described by D4 is a separate integration surface for
                Heaven/Summon. It is not the published four-tool package and is not a released
                local-checkout mode.
              </p>
              <dl className="mcp-mode-meta">
                <div>
                  <dt>Shape</dt>
                  <dd>Two-tool schema-dose surface</dd>
                </div>
                <div>
                  <dt>Current state</dt>
                  <dd>Separate profile; not this package surface</dd>
                </div>
                <div>
                  <dt>Best for</dt>
                  <dd>Future schema-dose integration</dd>
                </div>
              </dl>
            </article>
          </div>
        </section>

        {/* ── Available Tools ───────────────────────────────────────────── */}
        <section className="mcp-tools section-shell" aria-labelledby="available-tools-title">
          <header className="mcp-tools-head">
            <h2 id="available-tools-title">Available Tools (published v{version})</h2>
            <p>
              The observed {packageName}@{version} release exposes four published tools: the
              separate thin Heaven/Summon profile has its own two-tool schema-dose constraint,
              which is not a cap on this package surface. Setup commands below intentionally use
              the moving <code>{packageName}@latest</code> selector.
            </p>
          </header>
          <div className="mcp-tools-grid">
            {availableTools.map((tool, idx) => (
              <article className="mcp-tool-card" key={tool.name}>
                <div className="mcp-tool-index" aria-hidden="true">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div className="mcp-tool-body">
                  <h3 className="mcp-tool-name">{tool.name}</h3>
                  <p className="mcp-tool-desc">{tool.description}</p>
                  {Object.keys(tool.inputSchema.properties).length > 0 && (
                    <dl className="mcp-tool-params">
                      {Object.entries(tool.inputSchema.properties).map(([key, val]) => (
                        <div key={key}>
                          <dt>
                            <code>{key}</code>
                            {tool.inputSchema.required?.includes(key) && (
                              <span className="mcp-param-required" title="required">
                                *
                              </span>
                            )}
                          </dt>
                          <dd>{val.description}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Planned Tools ─────────────────────────────────────────────── */}
        <section className="mcp-tools section-shell" aria-labelledby="planned-tools-title">
          <header className="mcp-tools-head">
            <h2 id="planned-tools-title">Planned Capabilities</h2>
            <p>
              Separately planned for upcoming releases. These capabilities are not part of the
              current four-tool package surface.
            </p>
          </header>
          <div className="mcp-tools-grid">
            {plannedTools.map((tool, idx) => (
              <article className="mcp-tool-card" key={tool.name}>
                <div className="mcp-tool-index" aria-hidden="true">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div className="mcp-tool-body">
                  <h3 className="mcp-tool-name">{tool.name}</h3>
                  <p className="mcp-tool-desc">{tool.description}</p>
                  <dl className="mcp-tool-params">
                    {Object.entries(tool.inputSchema.properties).map(([key, val]) => (
                      <div key={key}>
                        <dt>
                          <code>{key}</code>
                          {tool.inputSchema.required?.includes(key) && (
                            <span className="mcp-param-required" title="required">
                              *
                            </span>
                          )}
                        </dt>
                        <dd>{val.description}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Integration ───────────────────────────────────────────────── */}
        <section className="mcp-integration section-shell" aria-labelledby="integration-title">
          <h2 id="integration-title">Wire it up in 60 seconds.</h2>
          <p className="mcp-integration-lede">
            Add Gaia MCP to your editor&apos;s config file, restart, and your agent gains the full
            Skill Tree as native tools.
          </p>

          <div className="mcp-tabs" role="tablist" aria-label="Editor integration instructions">
            {integrations.map((intg) => (
              <button
                key={intg.id}
                role="tab"
                aria-selected={activeTab === intg.id}
                aria-controls={`panel-${intg.id}`}
                id={`tab-${intg.id}`}
                className={`mcp-tab${activeTab === intg.id ? " mcp-tab-active" : ""}`}
                onClick={() => setActiveTab(intg.id)}
              >
                {intg.label}
              </button>
            ))}
          </div>

          <div
            className="mcp-tab-panel"
            role="tabpanel"
            id={`panel-${activeIntegration.id}`}
            aria-labelledby={`tab-${activeIntegration.id}`}
          >
            <p className="mcp-tab-file">
              Config file: <code>{activeIntegration.configFile}</code>
            </p>
            <div className="mcp-snippet-wrap">
              <pre className="mcp-snippet">
                <code>{activeIntegration.snippet}</code>
              </pre>
              <CopyCommand
                className="mcp-snippet-copy"
                command={activeIntegration.snippet}
              />
            </div>
          </div>

          <div className="mcp-integration-note">
            <p>
              <strong>MCP server:</strong> the snippets select the <code>gaia-mcp</code> binary
              explicitly from the scoped package, which publishes two binaries.
            </p>
            <p>
              <strong>Summon CLI:</strong> use either the public alias <code>{summonNpxCmd}</code>{" "}
              or the scoped package&apos;s explicit <code>{scopedSummonNpxCmd}</code> selector. Both
              paths are separate from the MCP server&apos;s <code>gaia-mcp</code> bin.
            </p>
            <p>
              <strong>Local checkouts:</strong> the published server reads the public registry;
              local-checkout support is not released and is not advertised here.
            </p>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className="mcp-cta section-shell" aria-labelledby="mcp-cta-title">
          <div className="mcp-cta-inner">
            <div>
              <p className="signal">
                <span /> OPEN SOURCE
              </p>
              <h2 id="mcp-cta-title">Get started today.</h2>
              <p>
                {packageName}@{version} is the observed published release; the setup command uses{" "}
                {packageName}@latest. Star the repository to follow development.
              </p>
            </div>
            <div className="mcp-cta-actions">
              <a
                className="button primary"
                href="https://github.com/gaia-research/gaia-mcp"
                target="_blank"
                rel="noreferrer"
              >
                Star on GitHub <span>↗</span>
              </a>
              <Link className="button secondary" href="/research">
                Browse research <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
