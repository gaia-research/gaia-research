import type { ReactNode } from "react";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import ClaimIndexFigures from "@/components/ClaimIndexFigures";
// loaded as raw text by webpack asset/source
import claimIndexMd from "@/content/reports/hh-benchmark/claim-index.md";

export const metadata = {
  title: "Claim index — every public Arc I number and the record behind it",
  description:
    "Every public Skill Heaven / Hell claim, listed with the committed record it traces to: a ledger line, a census field, a harness-probe run record — or an explicit uncommitted / not-probed marker. An index, not a measurement.",
};

// Render while the Markdown source is present at build time; Cloudflare Workers
// cannot read the deployed filesystem during a request.
export const dynamic = "force-static";
export const revalidate = false;

// Strip the H1 (the page header renders its own) and every HTML-comment line —
// which conveniently also hides the ledger-claims fences the gate reads.
function loadClaimIndex() {
  return claimIndexMd
    .split("\n")
    .filter((line: string) => !line.startsWith("# ") && !line.trim().startsWith("<!--"))
    .join("\n")
    .trim();
}

// The inventory tables are the page. Two cell roles get tagged so the status
// column reads as a column rather than as more prose — presentation only, driven
// by what the Markdown already says, never by a lookup table that could drift
// from it.
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
  // Status cells are terse; every other cell in these tables is a sentence.
  if (text.length > 90) return undefined;
  const hit = STATUS_FAMILY.find(([re]) => re.test(text));
  return hit ? `claim-status ${hit[1]}` : undefined;
}

const markdownComponents = {
  // Dense five-column tables scroll inside their own container; the page body
  // never scrolls sideways.
  table: ({ children, node }: { children?: ReactNode; node?: HastNode }) => {
    // Column count drives the width ladder: left to itself, `auto` starves the
    // "Where" column of path text while the "Record" column runs long.
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
  // Every record link leaves for GitHub; open it without losing the index.
  a: ({ children, href }: { children?: ReactNode; href?: string }) =>
    href?.startsWith("http") ? (
      <a href={href} target="_blank" rel="noreferrer">{children}</a>
    ) : (
      <a href={href}>{children}</a>
    ),
};

export default function HhBenchmarkClaimsPage() {
  const body = loadClaimIndex();
  return (
    <>
      <SiteHeader />
      <main id="main" className="report-page">
        <header className="report-head">
          <p className="signal"><span /> RESEARCH · LEDGER · CLAIM INDEX</p>
          <h1>Claim index</h1>
          <p className="report-sub">
            Every public number we have shipped, and the committed record it traces to &mdash;
            or an explicit mark saying it traces to none.
          </p>
          <dl className="report-meta">
            <div><dt>Binds</dt><dd>B4 &middot; no claim ships ahead of its benchmark</dd></div>
            <div><dt>Scope</dt><dd>Arc I &middot; Skill Heaven / Hell</dd></div>
            <div><dt>Status</dt><dd><span className="chip">MACHINE-GATED</span></dd></div>
          </dl>
          <div className="report-links">
            <Link href="/research/hh-benchmark">The method &rarr;</Link>
            <a href="https://github.com/gaia-research/gaia-research/blob/main/scripts/hell-heaven-bench/data/ledger.jsonl" target="_blank" rel="noreferrer">The ledger ↗</a>
            <a href="https://github.com/gaia-research/gaia-research/blob/main/scripts/hell-heaven-bench/check-claims.ts" target="_blank" rel="noreferrer">The gate ↗</a>
          </div>
        </header>

        <ClaimIndexFigures />

        <article className="report-body claim-body">
          <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{body}</Markdown>
        </article>

        <footer className="report-foot">
          <p>A declared gap is first-class evidence. A silent one is a defect.</p>
          <Link className="button secondary" href="/research/hh-benchmark">Back to the method <span>→</span></Link>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
