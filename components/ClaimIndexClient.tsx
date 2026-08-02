"use client";

import { useState, type ReactNode } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ClaimIndexClientProps {
  sections: {
    whatAndWhy: string;
    method: string;
    secA: string;
    secB: string;
    secC: string;
    secD: string;
    settle: string;
  };
}

const STATUS_FAMILY: [RegExp, "is-bound" | "is-gap" | "is-outside"][] = [
  [/^RECORD\b/, "is-bound"],
  [/^RUN RECORD\b/, "is-bound"],
  [/^‡/, "is-gap"],
  [/^NOT COMMITTED\b/, "is-gap"],
  [/^NOT PROBED\b/, "is-gap"],
  [/^SOFTENED\b/, "is-gap"],
  [/^OUT OF SCOPE\b/, "is-outside"],
  [/^clean\b/, "is-outside"],
];

type HastNode = { type?: string; tagName?: string; value?: string; children?: HastNode[] };

function countCells(node: HastNode | undefined): number {
  if (!node) return 0;
  if (node.tagName === "th" || node.tagName === "td") return 1;
  return (node.children ?? []).reduce((n, c) => n + countCells(c), 0);
}

function textOf(node: HastNode | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

function cellClass(node: HastNode | undefined): string | undefined {
  const text = textOf(node).trim();
  if (/^[ABC]\d+$/.test(text)) return "claim-id";
  if (text.length > 90) return undefined;
  const hit = STATUS_FAMILY.find(([re]) => re.test(text));
  return hit ? `claim-status ${hit[1]}` : undefined;
}

const markdownComponents = {
  table: ({ children, node }: { children?: ReactNode; node?: HastNode }) => {
    const head = node?.children?.find((c) => (c as { tagName?: string }).tagName === "thead");
    const cols = countCells(head);
    return (
      <div className={`claim-table-wrap cols-${cols}`}>
        <table>{children}</table>
      </div>
    );
  },
  td: ({ children, node }: { children?: ReactNode; node?: HastNode }) => (
    <td className={cellClass(node)}>{children}</td>
  ),
  a: ({ children, href }: { children?: ReactNode; href?: string }) =>
    href?.startsWith("http") ? (
      <a href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    ) : (
      <a href={href}>{children}</a>
    ),
};

export default function ClaimIndexClient({ sections }: ClaimIndexClientProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    method: false,
    secA: true,
    secB: true,
    secC: true,
    secD: true,
    settle: false,
  });

  const setAll = (val: boolean) => {
    setOpenSections({
      method: val,
      secA: val,
      secB: val,
      secC: val,
      secD: val,
      settle: val,
    });
  };

  return (
    <div className="claim-client-wrap">
      {/* Executive Summary Card: What this is & Why */}
      <section className="claim-exec-card">
        <h2>What this page is &amp; Why it exists</h2>
        <div className="claim-exec-markdown">
          <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {sections.whatAndWhy}
          </Markdown>
        </div>
      </section>

      {/* Methodology & Vocabulary Dropdown */}
      <details
        className="claim-accordion"
        open={openSections.method}
        onToggle={(e) => {
          const isOpen = (e.target as HTMLDetailsElement).open;
          setOpenSections((prev) => ({ ...prev, method: isOpen }));
        }}
      >
        <summary className="claim-accordion-summary">
          <div className="claim-accordion-title">
            <span className="claim-accordion-icon">{openSections.method ? "▼" : "▶"}</span>
            Methodology &amp; Status Vocabulary
          </div>
          <div className="claim-accordion-badges">
            <span className="claim-pill bound">3 Evidence Classes</span>
            <span className="claim-pill gap">6 Status Definitions</span>
          </div>
        </summary>
        <div className="claim-accordion-body">
          <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {sections.method}
          </Markdown>
        </div>
      </details>

      {/* Global Toolbar / Controls */}
      <div className="claim-controls">
        <div className="claim-controls-left">
          <span className="claim-controls-label">Inventory View:</span>
          <button
            type="button"
            className="claim-toggle-btn"
            onClick={() => setAll(true)}
          >
            Expand All
          </button>
          <button
            type="button"
            className="claim-toggle-btn"
            onClick={() => setAll(false)}
          >
            Collapse All
          </button>
        </div>
        <div className="claim-controls-right">
          <span className="claim-summary-tally">29 claims total (13 RECORD · 9 ‡ UNCOMMITTED · 7 OTHER)</span>
        </div>
      </div>

      {/* Section A */}
      <details
        className="claim-accordion"
        open={openSections.secA}
        onToggle={(e) => {
          const isOpen = (e.target as HTMLDetailsElement).open;
          setOpenSections((prev) => ({ ...prev, secA: isOpen }));
        }}
      >
        <summary className="claim-accordion-summary">
          <div className="claim-accordion-title">
            <span className="claim-accordion-icon">{openSections.secA ? "▼" : "▶"}</span>
            Section A — The Live Site
          </div>
          <div className="claim-accordion-badges">
            <span className="claim-pill bound">4 RECORD</span>
            <span className="claim-pill gap">1 SOFTENED</span>
            <span className="claim-pill">1 OUT OF SCOPE</span>
          </div>
        </summary>
        <div className="claim-accordion-body">
          <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {sections.secA}
          </Markdown>
        </div>
      </details>

      {/* Section B */}
      <details
        className="claim-accordion"
        open={openSections.secB}
        onToggle={(e) => {
          const isOpen = (e.target as HTMLDetailsElement).open;
          setOpenSections((prev) => ({ ...prev, secB: isOpen }));
        }}
      >
        <summary className="claim-accordion-summary">
          <div className="claim-accordion-title">
            <span className="claim-accordion-icon">{openSections.secB ? "▼" : "▶"}</span>
            Section B — gaia-research Markdown
          </div>
          <div className="claim-accordion-badges">
            <span className="claim-pill bound">3 RECORD</span>
            <span className="claim-pill gap">3 ‡ UNCOMMITTED</span>
            <span className="claim-pill gap">1 GATE HOLE</span>
            <span className="claim-pill">1 OUT OF SCOPE</span>
          </div>
        </summary>
        <div className="claim-accordion-body">
          <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {sections.secB}
          </Markdown>
        </div>
      </details>

      {/* Section C */}
      <details
        className="claim-accordion"
        open={openSections.secC}
        onToggle={(e) => {
          const isOpen = (e.target as HTMLDetailsElement).open;
          setOpenSections((prev) => ({ ...prev, secC: isOpen }));
        }}
      >
        <summary className="claim-accordion-summary">
          <div className="claim-accordion-title">
            <span className="claim-accordion-icon">{openSections.secC ? "▼" : "▶"}</span>
            Section C — The skill-heaven Repo
          </div>
          <div className="claim-accordion-badges">
            <span className="claim-pill bound">2 RECORD</span>
            <span className="claim-pill bound">2 RUN RECORD</span>
            <span className="claim-pill gap">3 ‡ UNCOMMITTED</span>
            <span className="claim-pill gap">1 NOT PROBED</span>
          </div>
        </summary>
        <div className="claim-accordion-body">
          <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {sections.secC}
          </Markdown>
        </div>
      </details>

      {/* Section D */}
      <details
        className="claim-accordion"
        open={openSections.secD}
        onToggle={(e) => {
          const isOpen = (e.target as HTMLDetailsElement).open;
          setOpenSections((prev) => ({ ...prev, secD: isOpen }));
        }}
      >
        <summary className="claim-accordion-summary">
          <div className="claim-accordion-title">
            <span className="claim-accordion-icon">{openSections.secD ? "▼" : "▶"}</span>
            Section D — KC9 Three-Minute Demo
          </div>
          <div className="claim-accordion-badges">
            <span className="claim-pill bound">2 RECORD</span>
            <span className="claim-pill gap">2 ‡ UNCOMMITTED</span>
            <span className="claim-pill">3 CITED BY PATH</span>
          </div>
        </summary>
        <div className="claim-accordion-body">
          <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {sections.secD}
          </Markdown>
        </div>
      </details>

      {/* Settlement & Scope Footer */}
      <details
        className="claim-accordion"
        open={openSections.settle}
        onToggle={(e) => {
          const isOpen = (e.target as HTMLDetailsElement).open;
          setOpenSections((prev) => ({ ...prev, settle: isOpen }));
        }}
      >
        <summary className="claim-accordion-summary">
          <div className="claim-accordion-title">
            <span className="claim-accordion-icon">{openSections.settle ? "▼" : "▶"}</span>
            What this Index Does &amp; Does Not Settle
          </div>
          <div className="claim-accordion-badges">
            <span className="claim-pill bound">Settlement Scope</span>
          </div>
        </summary>
        <div className="claim-accordion-body">
          <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {sections.settle}
          </Markdown>
        </div>
      </details>
    </div>
  );
}
