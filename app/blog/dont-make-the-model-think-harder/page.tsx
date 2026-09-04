import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import novaAuthor from "@/content/authors/nova.json";
import PostShareBar from "@/components/PostShareBar";
import { dontMakeTheModelThinkHarderThumbnail } from "@/data/blog";
import postMd from "@/content/blog/dont-make-the-model-think-harder/post.md";
import {
  MobileFigureEffortSpectrum,
  MobileFigureWhatsMissing,
  MobileFigureTwoEngines,
  MobileFigureToolsVsThinking,
  MobileFigureSweetSpotCurve,
  MobileFigureEscalationLadder,
  MobileFigureThreeAgents,
  MobileFigureSummaryLoop,
} from "./mobile-figures";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/dont-make-the-model-think-harder";
const articleUrl = `${siteUrl}${articlePath}`;
const thumbnailUrl = `${siteUrl}${dontMakeTheModelThinkHarderThumbnail.src.src}`;
const articleTitle =
  "Don’t Make the Model Think Harder Than the Problem: Reasoning Effort Is a Search Budget, Not an Intelligence Slider";
const articleDescription =
  "Why reasoning effort is an exploratory search budget across frozen weights rather than an intelligence dial. The triad of facts, inference, and confidence, Sutton's Bitter Lesson in agents, and the Minimum Sufficient Deliberation sweet spot.";

export const metadata = {
  title: articleTitle,
  description: articleDescription,
  keywords: [
    "Reasoning Effort",
    "Test-Time Compute",
    "Search Budget",
    "Claude Code",
    "Agent Design",
    "The Bitter Lesson",
    "Overthinking",
    "Minimum Sufficient Deliberation",
    "Gaia Research",
  ],
  alternates: { canonical: articlePath },
  openGraph: {
    type: "article",
    url: articlePath,
    title: articleTitle,
    description: articleDescription,
    publishedTime: "2026-09-04T00:00:00+08:00",
    authors: [novaAuthor.display_name],
    images: [
      {
        url: dontMakeTheModelThinkHarderThumbnail.src.src,
        width: 1600,
        height: 900,
        alt: dontMakeTheModelThinkHarderThumbnail.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
    images: [dontMakeTheModelThinkHarderThumbnail.src.src],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: articleTitle,
  description: articleDescription,
  image: thumbnailUrl,
  url: articleUrl,
  datePublished: "2026-09-04T00:00:00+08:00",
  author: {
    "@type": "Person",
    name: novaAuthor.display_name,
    url: novaAuthor.links.github,
  },
  publisher: {
    "@type": "Organization",
    name: "Gaia Research",
    url: siteUrl,
  },
};

function FigureEffortSpectrum() {
  return (
    <figure className="blog-post-figure" style={{ margin: "32px 0" }}>
      <div className="blog-svg-desktop">
        <svg
          viewBox="0 0 900 340"
        role="img"
        aria-labelledby="effort-spectrum-title effort-spectrum-desc"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title id="effort-spectrum-title">
          Reasoning Effort: A Search Budget, Not an Intelligence Slider
        </title>
        <desc id="effort-spectrum-desc">
          A comparison between the flawed misconception of reasoning effort as an intelligence slider
          from dumb to genius versus the true mental model: reasoning effort as a test-time search budget
          across effort levels none, low, medium, high, xhigh, and max over frozen weights.
        </desc>
        <defs>
          <linearGradient id="eff-dial-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        <rect width="900" height="340" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

        <text
          x="450"
          y="28"
          textAnchor="middle"
          fill="#f8fafc"
          fontSize="15"
          fontWeight="700"
          letterSpacing="0.4"
        >
          REASONING EFFORT: A SEARCH BUDGET, NOT AN INTELLIGENCE SLIDER
        </text>
        <text x="450" y="46" textAnchor="middle" fill="#94a3b8" fontSize="11.5">
          Deliberation time increases tree exploration depth across frozen weights — not intrinsic model IQ
        </text>

        {/* Top Row: False Mental Model */}
        <g id="eff-false-model">
          <rect
            x="28"
            y="60"
            width="844"
            height="62"
            rx="10"
            fill="#0f0910"
            stroke="#7f1d1d"
            strokeWidth="1"
            strokeDasharray="5 3"
          />
          <rect x="40" y="70" width="168" height="20" rx="4" fill="#450a0a" stroke="#dc2626" strokeWidth="0.8" />
          <text x="124" y="84" textAnchor="middle" fill="#f87171" fontSize="10.5" fontWeight="700" letterSpacing="0.3">
            ✕ FLAWED MENTAL MODEL
          </text>
          <text x="124" y="107" textAnchor="middle" fill="#94a3b8" fontSize="11">
            &quot;The Intelligence Slider&quot;
          </text>

          <text x="235" y="96" fill="#94a3b8" fontSize="12" fontWeight="600" textAnchor="start">
            &quot;Dumb&quot; Fast Mode
          </text>

          <line x1="365" y1="92" x2="625" y2="92" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="365" y1="92" x2="625" y2="92" stroke="#f87171" strokeWidth="1.5" strokeDasharray="4 4" />

          <line x1="355" y1="104" x2="635" y2="80" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="440" y="80" width="112" height="24" rx="12" fill="#2d0b14" stroke="#f87171" strokeWidth="1" />
          <text x="496" y="96" textAnchor="middle" fill="#f87171" fontSize="11" fontWeight="700">
            Flawed Premise
          </text>

          <text x="645" y="96" fill="#f87171" fontSize="12" fontWeight="600" textAnchor="start">
            &quot;Genius&quot; Slow Mode
          </text>

          <rect x="740" y="67" width="120" height="48" rx="6" fill="#200d14" stroke="#ef4444" strokeWidth="1" />
          <text x="800" y="86" textAnchor="middle" fill="#f87171" fontSize="11" fontWeight="700">
            IQ Stays Fixed
          </text>
          <text x="800" y="102" textAnchor="middle" fill="#fca5a5" fontSize="10">
            Weights are frozen
          </text>
        </g>

        {/* Bottom Row: True Mental Model */}
        <g id="eff-true-model">
          <rect x="28" y="132" width="844" height="164" rx="10" fill="#070e1a" stroke="#1e3a5f" strokeWidth="1" />

          <rect x="40" y="140" width="156" height="20" rx="4" fill="#0c2d48" stroke="#0284c7" strokeWidth="0.8" />
          <text x="118" y="154" textAnchor="middle" fill="#38bdf8" fontSize="10.5" fontWeight="700" letterSpacing="0.3">
            ✓ GROUND-TRUTH REALITY
          </text>
          <text x="210" y="155" fill="#f8fafc" fontSize="12" fontWeight="700">
            Reasoning Effort = Test-Time Search Budget
          </text>

          <text x="590" y="154" fill="#38bdf8" fontSize="11" fontWeight="600" textAnchor="end">
            Little search
          </text>
          <rect x="600" y="146" width="130" height="8" rx="4" fill="url(#eff-dial-grad)" />
          <text x="740" y="154" fill="#ec4899" fontSize="11" fontWeight="600" textAnchor="start">
            Deep search
          </text>

          {/* 6 Effort Level Cards */}
          {/* none */}
          <g transform="translate(38, 168)">
            <rect width="132" height="118" rx="8" fill="#0b1322" stroke="#334155" strokeWidth="1" />
            <rect x="6" y="6" width="120" height="20" rx="4" fill="#1e293b" />
            <text x="14" y="20" fill="#cbd5e1" fontSize="11.5" fontWeight="700" fontFamily="monospace">none</text>
            <text x="118" y="20" fill="#94a3b8" fontSize="10" textAnchor="end">0 tokens</text>
            <g transform="translate(6, 32)">
              <rect width="120" height="50" rx="4" fill="#040711" />
              <circle cx="60" cy="14" r="4.5" fill="#94a3b8" />
              <line x1="60" y1="18" x2="60" y2="34" stroke="#475569" strokeWidth="1.5" />
              <circle cx="60" cy="36" r="3.5" fill="#64748b" />
              <text x="72" y="27" fill="#64748b" fontSize="9.5">1 pass</text>
            </g>
            <text x="66" y="96" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600">Direct Pass</text>
            <text x="66" y="110" textAnchor="middle" fill="#94a3b8" fontSize="10">Zero thinking tokens</text>
          </g>

          {/* low */}
          <g transform="translate(178, 168)">
            <rect width="132" height="118" rx="8" fill="#0b1322" stroke="#0284c7" strokeWidth="1.2" />
            <rect x="6" y="6" width="120" height="20" rx="4" fill="#0c2d48" />
            <text x="14" y="20" fill="#38bdf8" fontSize="11.5" fontWeight="700" fontFamily="monospace">low</text>
            <text x="118" y="20" fill="#7dd3fc" fontSize="10" textAnchor="end">~1k tokens</text>
            <g transform="translate(6, 32)">
              <rect width="120" height="50" rx="4" fill="#040711" />
              <circle cx="60" cy="12" r="4" fill="#38bdf8" />
              <line x1="60" y1="14" x2="42" y2="34" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1="60" y1="14" x2="78" y2="34" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
              <circle cx="42" cy="36" r="3.5" fill="#38bdf8" />
              <circle cx="78" cy="36" r="3" fill="#64748b" />
              <text x="78" y="47" fill="#f87171" fontSize="9" textAnchor="middle">pruned</text>
            </g>
            <text x="66" y="96" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600">Local Fork</text>
            <text x="66" y="110" textAnchor="middle" fill="#94a3b8" fontSize="10">1-2 branch checks</text>
          </g>

          {/* medium */}
          <g transform="translate(318, 168)">
            <rect width="132" height="118" rx="8" fill="#0b1322" stroke="#0ea5e9" strokeWidth="1.2" />
            <rect x="6" y="6" width="120" height="20" rx="4" fill="#082b45" />
            <text x="14" y="20" fill="#38bdf8" fontSize="11.5" fontWeight="700" fontFamily="monospace">medium</text>
            <text x="118" y="20" fill="#7dd3fc" fontSize="10" textAnchor="end">~4k tokens</text>
            <g transform="translate(6, 32)">
              <rect width="120" height="50" rx="4" fill="#040711" />
              <circle cx="60" cy="10" r="3.5" fill="#38bdf8" />
              <line x1="60" y1="12" x2="44" y2="24" stroke="#475569" strokeWidth="1.2" />
              <line x1="60" y1="12" x2="76" y2="24" stroke="#0ea5e9" strokeWidth="1.5" />
              <circle cx="44" cy="25" r="3" fill="#64748b" />
              <circle cx="76" cy="25" r="3" fill="#0ea5e9" />
              <line x1="76" y1="27" x2="64" y2="40" stroke="#0ea5e9" strokeWidth="1.5" />
              <line x1="76" y1="27" x2="88" y2="40" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
              <circle cx="64" cy="41" r="3" fill="#34d399" />
              <circle cx="88" cy="41" r="2.5" fill="#f87171" />
            </g>
            <text x="66" y="96" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600">Backtrack &amp; Fix</text>
            <text x="66" y="110" textAnchor="middle" fill="#94a3b8" fontSize="10">Multi-step verify</text>
          </g>

          {/* high */}
          <g transform="translate(458, 168)">
            <rect width="132" height="118" rx="8" fill="#0b1322" stroke="#a855f7" strokeWidth="1.2" />
            <rect x="6" y="6" width="120" height="20" rx="4" fill="#2e1045" />
            <text x="14" y="20" fill="#c084fc" fontSize="11.5" fontWeight="700" fontFamily="monospace">high</text>
            <text x="118" y="20" fill="#e9d5ff" fontSize="10" textAnchor="end">~16k tokens</text>
            <g transform="translate(6, 32)">
              <rect width="120" height="50" rx="4" fill="#040711" />
              <circle cx="60" cy="8" r="3" fill="#c084fc" />
              <line x1="60" y1="10" x2="35" y2="20" stroke="#a855f7" strokeWidth="1" />
              <line x1="60" y1="10" x2="60" y2="20" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="60" y1="10" x2="85" y2="20" stroke="#a855f7" strokeWidth="1.2" />
              <circle cx="35" cy="22" r="2.5" fill="#a855f7" />
              <circle cx="85" cy="22" r="2.5" fill="#c084fc" />
              <line x1="35" y1="24" x2="25" y2="36" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="35" y1="24" x2="45" y2="36" stroke="#a855f7" strokeWidth="1" />
              <line x1="85" y1="24" x2="75" y2="36" stroke="#a855f7" strokeWidth="1" />
              <line x1="85" y1="24" x2="95" y2="36" stroke="#c084fc" strokeWidth="1.5" />
              <circle cx="95" cy="38" r="3" fill="#34d399" />
            </g>
            <text x="66" y="96" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600">Deep Multi-Path</text>
            <text x="66" y="110" textAnchor="middle" fill="#94a3b8" fontSize="10">Branch exploration</text>
          </g>

          {/* xhigh */}
          <g transform="translate(598, 168)">
            <rect width="132" height="118" rx="8" fill="#0b1322" stroke="#f472b6" strokeWidth="1.2" />
            <rect x="6" y="6" width="120" height="20" rx="4" fill="#380d28" />
            <text x="14" y="20" fill="#f472b6" fontSize="11.5" fontWeight="700" fontFamily="monospace">xhigh</text>
            <text x="118" y="20" fill="#fbcfe8" fontSize="10" textAnchor="end">~32k tokens</text>
            <g transform="translate(6, 32)">
              <rect width="120" height="50" rx="4" fill="#040711" />
              <circle cx="60" cy="7" r="3" fill="#f472b6" />
              <line x1="60" y1="9" x2="30" y2="18" stroke="#f472b6" strokeWidth="1" />
              <line x1="60" y1="9" x2="90" y2="18" stroke="#f472b6" strokeWidth="1" />
              <circle cx="30" cy="19" r="2.5" fill="#f472b6" />
              <circle cx="90" cy="19" r="2.5" fill="#f472b6" />
              <line x1="30" y1="21" x2="20" y2="31" stroke="#f472b6" strokeWidth="0.8" />
              <line x1="30" y1="21" x2="40" y2="31" stroke="#f472b6" strokeWidth="1" />
              <line x1="90" y1="21" x2="80" y2="31" stroke="#475569" strokeWidth="0.8" strokeDasharray="1 1" />
              <line x1="90" y1="21" x2="100" y2="31" stroke="#f472b6" strokeWidth="1.2" />
              <circle cx="40" cy="32" r="2" fill="#f472b6" />
              <circle cx="100" cy="32" r="2.5" fill="#34d399" />
              <line x1="100" y1="34" x2="100" y2="44" stroke="#34d399" strokeWidth="1.5" />
              <circle cx="100" cy="45" r="3" fill="#34d399" />
            </g>
            <text x="66" y="96" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600">Deep Exploration</text>
            <text x="66" y="110" textAnchor="middle" fill="#94a3b8" fontSize="10">Extended CoT budget</text>
          </g>

          {/* max */}
          <g transform="translate(738, 168)">
            <rect width="132" height="118" rx="8" fill="#0b1322" stroke="#ec4899" strokeWidth="1.5" />
            <rect x="6" y="6" width="120" height="20" rx="4" fill="#3b0a27" />
            <text x="14" y="20" fill="#ec4899" fontSize="11.5" fontWeight="700" fontFamily="monospace">max</text>
            <text x="118" y="20" fill="#f472b6" fontSize="10" textAnchor="end">~64k+ tokens</text>
            <g transform="translate(6, 32)">
              <rect width="120" height="50" rx="4" fill="#040711" />
              <circle cx="60" cy="6" r="3" fill="#ec4899" />
              <line x1="60" y1="8" x2="25" y2="16" stroke="#ec4899" strokeWidth="0.8" />
              <line x1="60" y1="8" x2="60" y2="16" stroke="#ec4899" strokeWidth="0.8" />
              <line x1="60" y1="8" x2="95" y2="16" stroke="#ec4899" strokeWidth="1.2" />
              <circle cx="25" cy="18" r="2" fill="#ec4899" />
              <circle cx="60" cy="18" r="2" fill="#ec4899" />
              <circle cx="95" cy="18" r="2.5" fill="#ec4899" />
              <line x1="95" y1="20" x2="80" y2="30" stroke="#ec4899" strokeWidth="1" />
              <line x1="95" y1="20" x2="105" y2="30" stroke="#ec4899" strokeWidth="1.5" />
              <circle cx="105" cy="32" r="2.5" fill="#34d399" />
              <line x1="105" y1="34" x2="105" y2="44" stroke="#34d399" strokeWidth="2" />
              <circle cx="105" cy="45" r="3.5" fill="#34d399" stroke="#fbbf24" strokeWidth="1" />
            </g>
            <text x="66" y="96" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600">Frontier Search</text>
            <text x="66" y="110" textAnchor="middle" fill="#94a3b8" fontSize="10">Exhaustive budget</text>
          </g>
        </g>

        <text x="450" y="322" textAnchor="middle" fill="#64748b" fontSize="11">
          Illustrative · Conceptual search depth analogues across test-time compute tiers over frozen parametric weights.
        </text>
      </svg>
      </div>
      <div className="blog-svg-mobile">
        <MobileFigureEffortSpectrum />
      </div>
    </figure>
  );
}

function FigureWhatsMissing() {
  return (
    <figure className="blog-post-figure" style={{ margin: "32px 0" }}>
      <div className="blog-svg-desktop">
        <svg
          viewBox="0 0 900 380"
        role="img"
        aria-labelledby="whats-missing-title whats-missing-desc"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title id="whats-missing-title">Triage the Bottleneck: What Is Actually Missing?</title>
        <desc id="whats-missing-desc">
          A triage decision tree mapping three missing elements (Facts, Inference, Confidence)
          to their distinct root bottlenecks, anti-pattern traps, and correct engineering actions
          (Retrieve, Reason, Verify).
        </desc>
        <defs>
          <marker id="wm-arr-cyan" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4.5" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#38bdf8" />
          </marker>
          <marker id="wm-arr-pink" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4.5" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#ec4899" />
          </marker>
          <marker id="wm-arr-green" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4.5" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#34d399" />
          </marker>
        </defs>

        <rect width="900" height="380" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

        <text
          x="450"
          y="28"
          textAnchor="middle"
          fill="#f8fafc"
          fontSize="15"
          fontWeight="700"
          letterSpacing="0.4"
        >
          TRIAGE THE BOTTLENECK: WHAT IS ACTUALLY MISSING?
        </text>
        <text x="450" y="46" textAnchor="middle" fill="#94a3b8" fontSize="11.5">
          Isolate whether the gap is missing evidence, logical deduction, or empirical proof before allocating compute
        </text>

        {/* Root Node */}
        <g id="wm-root" transform="translate(330, 62)">
          <rect width="240" height="42" rx="10" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="22" cy="21" r="4" fill="#38bdf8" />
          <circle cx="34" cy="21" r="4" fill="#ec4899" />
          <circle cx="46" cy="21" r="4" fill="#34d399" />
          <text x="136" y="20" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="800" letterSpacing="0.4">
            WHAT&apos;S MISSING?
          </text>
          <text x="136" y="34" textAnchor="middle" fill="#94a3b8" fontSize="10.5">
            Identify the limiting factor first
          </text>
        </g>

        {/* Connectors */}
        <path
          d="M 370 104 C 370 124, 167 120, 167 136"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeDasharray="5 3"
          markerEnd="url(#wm-arr-cyan)"
        />
        <path
          d="M 450 104 L 450 136"
          fill="none"
          stroke="#ec4899"
          strokeWidth="2"
          strokeDasharray="5 3"
          markerEnd="url(#wm-arr-pink)"
        />
        <path
          d="M 530 104 C 530 124, 733 120, 733 136"
          fill="none"
          stroke="#34d399"
          strokeWidth="2"
          strokeDasharray="5 3"
          markerEnd="url(#wm-arr-green)"
        />

        {/* Card 1: FACTS */}
        <g transform="translate(34, 140)">
          <rect width="266" height="195" rx="12" fill="#061220" stroke="#38bdf8" strokeWidth="1.5" />
          <path d="M 0 12 Q 0 0 12 0 L 254 0 Q 266 0 266 12 L 266 34 L 0 34 Z" fill="#0c2338" />
          <rect x="10" y="6" width="76" height="22" rx="4" fill="#073a5a" />
          <text x="48" y="21" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="800">1. FACTS</text>
          <text x="96" y="21" fill="#cbd5e1" fontSize="11" fontWeight="600">Missing Evidence</text>

          <rect x="10" y="42" width="246" height="52" rx="6" fill="#081a2e" stroke="#1e3a5f" strokeWidth="1" />
          <text x="18" y="58" fill="#38bdf8" fontSize="10" fontWeight="700">ROOT BOTTLENECK:</text>
          <text x="18" y="73" fill="#e2e8f0" fontSize="11">Model lacks current state,</text>
          <text x="18" y="87" fill="#e2e8f0" fontSize="11">repo context, or runtime output.</text>

          <text x="10" y="109" fill="#f87171" fontSize="10.5">
            ⚠️ Thinking harder cannot invent repo files
          </text>

          <rect x="10" y="118" width="246" height="67" rx="8" fill="#0a2a44" stroke="#38bdf8" strokeWidth="1.2" />
          <text x="20" y="136" fill="#38bdf8" fontSize="12" fontWeight="800">ACTION: RETRIEVE</text>
          <text x="20" y="154" fill="#cbd5e1" fontSize="11">Tools: grep, read, API, fetch, ls</text>
          <text x="20" y="172" fill="#7dd3fc" fontSize="10.5">Cost: Fast deterministic read (0 tokens)</text>
        </g>

        {/* Card 2: INFERENCE */}
        <g transform="translate(317, 140)">
          <rect width="266" height="195" rx="12" fill="#180716" stroke="#ec4899" strokeWidth="1.5" />
          <path d="M 0 12 Q 0 0 12 0 L 254 0 Q 266 0 266 12 L 266 34 L 0 34 Z" fill="#320d2c" />
          <rect x="10" y="6" width="98" height="22" rx="4" fill="#521345" />
          <text x="59" y="21" textAnchor="middle" fill="#ec4899" fontSize="11" fontWeight="800">2. INFERENCE</text>
          <text x="118" y="21" fill="#cbd5e1" fontSize="11" fontWeight="600">Multi-Step Logic</text>

          <rect x="10" y="42" width="246" height="52" rx="6" fill="#240c20" stroke="#4c183e" strokeWidth="1" />
          <text x="18" y="58" fill="#ec4899" fontSize="10" fontWeight="700">ROOT BOTTLENECK:</text>
          <text x="18" y="73" fill="#e2e8f0" fontSize="11">Model has evidence but needs</text>
          <text x="18" y="87" fill="#e2e8f0" fontSize="11">multi-step logical deduction.</text>

          <text x="10" y="109" fill="#f87171" fontSize="10.5">
            ⚠️ Dumping more context won&apos;t solve math
          </text>

          <rect x="10" y="118" width="246" height="67" rx="8" fill="#3b0f34" stroke="#ec4899" strokeWidth="1.2" />
          <text x="20" y="136" fill="#ec4899" fontSize="12" fontWeight="800">ACTION: REASON</text>
          <text x="20" y="154" fill="#cbd5e1" fontSize="11">Tools: Reasoning tokens, CoT, search</text>
          <text x="20" y="172" fill="#f472b6" fontSize="10.5">Cost: Compute-intensive test-time tokens</text>
        </g>

        {/* Card 3: CONFIDENCE */}
        <g transform="translate(600, 140)">
          <rect width="266" height="195" rx="12" fill="#04160f" stroke="#34d399" strokeWidth="1.5" />
          <path d="M 0 12 Q 0 0 12 0 L 254 0 Q 266 0 266 12 L 266 34 L 0 34 Z" fill="#072d1f" />
          <rect x="10" y="6" width="108" height="22" rx="4" fill="#0c4a32" />
          <text x="64" y="21" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="800">3. CONFIDENCE</text>
          <text x="126" y="21" fill="#cbd5e1" fontSize="11" fontWeight="600">Empirical Proof</text>

          <rect x="10" y="42" width="246" height="52" rx="6" fill="#082318" stroke="#145237" strokeWidth="1" />
          <text x="18" y="58" fill="#34d399" fontSize="10" fontWeight="700">ROOT BOTTLENECK:</text>
          <text x="18" y="73" fill="#e2e8f0" fontSize="11">Candidate solution exists, but</text>
          <text x="18" y="87" fill="#e2e8f0" fontSize="11">empirical validity is uncertain.</text>

          <text x="10" y="109" fill="#f87171" fontSize="10.5">
            ⚠️ Internal self-rumination ≠ ground truth
          </text>

          <rect x="10" y="118" width="246" height="67" rx="8" fill="#083824" stroke="#34d399" strokeWidth="1.2" />
          <text x="20" y="136" fill="#34d399" fontSize="12" fontWeight="800">ACTION: VERIFY</text>
          <text x="20" y="154" fill="#cbd5e1" fontSize="11">Tools: Compiler, test runner, linter</text>
          <text x="20" y="172" fill="#6ee7b7" fontSize="10.5">Cost: Deterministic execution (stops early)</text>
        </g>

        <text x="450" y="353" textAnchor="middle" fill="#94a3b8" fontSize="11.5">
          Engineering Rule: Retrieve facts first · Reason over constraints · Verify in runtime
        </text>
        <text x="450" y="369" textAnchor="middle" fill="#64748b" fontSize="10.5">
          Illustrative · conceptual framework for agent deliberation allocation
        </text>
      </svg>
      </div>
      <div className="blog-svg-mobile">
        <MobileFigureWhatsMissing />
      </div>
    </figure>
  );
}

function FigureTwoEngines() {
  return (
    <figure className="blog-post-figure" style={{ margin: "32px 0" }}>
      <div className="blog-svg-desktop">
        <svg
          viewBox="0 0 900 420"
        role="img"
        aria-labelledby="two-engines-title two-engines-desc"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title id="two-engines-title">The Dual-Engine Architecture of Machine Deliberation</title>
        <desc id="two-engines-desc">
          An architecture diagram grounded in Richard Sutton&apos;s Bitter Lesson: Engine 1 represents
          pre-trained parametric knowledge (What I Know Already), Engine 2 represents test-time
          search and verification compute (What I Must Work Out Now), converging into minimum
          sufficient deliberation for an optimal answer.
        </desc>
        <defs>
          <marker id="te-arr-cyan" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4.5" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#38bdf8" />
          </marker>
          <marker id="te-arr-pink" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4.5" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#ec4899" />
          </marker>
        </defs>

        <rect width="900" height="420" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

        <text
          x="450"
          y="28"
          textAnchor="middle"
          fill="#f8fafc"
          fontSize="15"
          fontWeight="700"
          letterSpacing="0.4"
        >
          THE DUAL-ENGINE ARCHITECTURE OF MACHINE DELIBERATION
        </text>
        <text x="450" y="46" textAnchor="middle" fill="#94a3b8" fontSize="11.5">
          Sutton&apos;s Bitter Lesson in Agentic Systems: Learning (Parametric Priors) vs. Search (Test-Time Compute)
        </text>

        {/* Root Problem Node */}
        <g id="te-problem" transform="translate(350, 62)">
          <rect width="200" height="42" rx="10" fill="#111827" stroke="#475569" strokeWidth="1.5" />
          <circle cx="22" cy="21" r="4" fill="#fbbf24" />
          <text x="110" y="20" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="800">
            PROBLEM INPUT
          </text>
          <text x="110" y="34" textAnchor="middle" fill="#94a3b8" fontSize="10.5">
            Task prompt &amp; constraints
          </text>
        </g>

        {/* Divergent Connectors */}
        <path
          d="M 400 104 C 400 124, 235 120, 235 136"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeDasharray="5 3"
          markerEnd="url(#te-arr-cyan)"
        />
        <rect x="272" y="112" width="94" height="18" rx="4" fill="#0c233a" />
        <text x="319" y="125" textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="700">
          PARAMETRIC
        </text>

        <path
          d="M 500 104 C 500 124, 665 120, 665 136"
          fill="none"
          stroke="#ec4899"
          strokeWidth="2"
          strokeDasharray="5 3"
          markerEnd="url(#te-arr-pink)"
        />
        <rect x="536" y="112" width="102" height="18" rx="4" fill="#320d2c" />
        <text x="587" y="125" textAnchor="middle" fill="#ec4899" fontSize="9.5" fontWeight="700">
          NON-PARAMETRIC
        </text>

        {/* ENGINE 1: LEARNING (Left) */}
        <g transform="translate(40, 138)">
          <rect width="390" height="160" rx="12" fill="#061220" stroke="#38bdf8" strokeWidth="1.5" />
          <path d="M 0 12 Q 0 0 12 0 L 378 0 Q 390 0 390 12 L 390 36 L 0 36 Z" fill="#0c233a" />
          <rect x="10" y="7" width="138" height="22" rx="4" fill="#073a5a" />
          <text x="79" y="22" textAnchor="middle" fill="#38bdf8" fontSize="10.5" fontWeight="800">
            ENGINE 1: LEARNING
          </text>
          <text x="158" y="23" fill="#f8fafc" fontSize="12.5" fontWeight="800">
            WHAT I KNOW ALREADY
          </text>

          <text x="14" y="52" fill="#7dd3fc" fontSize="11" fontWeight="600">
            Zero test-time compute · Instant parametric recall
          </text>

          <g transform="translate(14, 68)">
            <text x="0" y="0" fill="#cbd5e1" fontSize="11">
              • Priors &amp; training weights (language syntax, idioms, standard APIs)
            </text>
            <text x="0" y="18" fill="#cbd5e1" fontSize="11">
              • Architectural heuristics &amp; recognized domain patterns
            </text>
            <text x="0" y="36" fill="#cbd5e1" fontSize="11">
              • System 1 immediate associative recall (fast, low latency, $0 search)
            </text>
            <text x="0" y="54" fill="#94a3b8" fontSize="11">
              • Fixed boundary: cannot invent missing facts or verify edge cases
            </text>
          </g>
        </g>

        {/* ENGINE 2: SEARCH (Right) */}
        <g transform="translate(470, 138)">
          <rect width="390" height="160" rx="12" fill="#180716" stroke="#ec4899" strokeWidth="1.5" />
          <path d="M 0 12 Q 0 0 12 0 L 378 0 Q 390 0 390 12 L 390 36 L 0 36 Z" fill="#320d2c" />
          <rect x="10" y="7" width="130" height="22" rx="4" fill="#521345" />
          <text x="75" y="22" textAnchor="middle" fill="#ec4899" fontSize="10.5" fontWeight="800">
            ENGINE 2: SEARCH
          </text>
          <text x="150" y="23" fill="#f8fafc" fontSize="12.5" fontWeight="800">
            WHAT I MUST WORK OUT NOW
          </text>

          <text x="14" y="52" fill="#f472b6" fontSize="11" fontWeight="600">
            Scalable test-time compute · Grounded runtime exploration
          </text>

          <g transform="translate(14, 68)">
            <text x="0" y="0" fill="#cbd5e1" fontSize="11">
              • Search budget &amp; reasoning effort (CoT tokens, branch exploration)
            </text>
            <text x="0" y="18" fill="#cbd5e1" fontSize="11">
              • Active tool executions (retrieval, grep, file reads, runtime inspection)
            </text>
            <text x="0" y="36" fill="#cbd5e1" fontSize="11">
              • Deterministic runtime verification (test suites, linters, compiler)
            </text>
            <text x="0" y="54" fill="#cbd5e1" fontSize="11">
              • Elastic depth: scales compute dynamically to task complexity
            </text>
          </g>
        </g>

        {/* Convergence paths */}
        <path
          d="M 235 298 C 235 314, 370 312, 390 320"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2"
          markerEnd="url(#te-arr-cyan)"
        />
        <path
          d="M 665 298 C 665 314, 530 312, 510 320"
          fill="none"
          stroke="#ec4899"
          strokeWidth="2"
          markerEnd="url(#te-arr-pink)"
        />

        {/* Convergence Box */}
        <g id="te-convergence" transform="translate(125, 320)">
          <rect width="650" height="56" rx="12" fill="#042016" stroke="#34d399" strokeWidth="1.8" />
          <text x="325" y="24" textAnchor="middle" fill="#34d399" fontSize="13.5" fontWeight="800" letterSpacing="0.4">
            MINIMUM SUFFICIENT DELIBERATION → OPTIMAL ANSWER
          </text>
          <text x="325" y="44" textAnchor="middle" fill="#a7f3d0" fontSize="11.5">
            Rely on priors where solid · Search only where uncertain · Halt the instant tests pass
          </text>
        </g>

        <text x="450" y="396" textAnchor="middle" fill="#cbd5e1" fontSize="11.5" fontStyle="italic">
          Grounded in Richard Sutton&apos;s Bitter Lesson (2019): computation scales through search and learning.
        </text>
        <text x="450" y="411" textAnchor="middle" fill="#64748b" fontSize="10.5">
          Illustrative · conceptual framework for balancing parametric memory with test-time search
        </text>
      </svg>
      </div>
      <div className="blog-svg-mobile">
        <MobileFigureTwoEngines />
      </div>
    </figure>
  );
}

function FigureToolsVsThinking() {
  return (
    <figure className="blog-post-figure" style={{ margin: "32px 0" }}>
      <div className="blog-svg-desktop">
        <svg
          viewBox="0 0 960 440"
        role="img"
        aria-labelledby="tools-vs-thinking-title tools-vs-thinking-desc"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title id="tools-vs-thinking-title">
          Debugging Loops: Speculative Deliberation vs. Deterministic Ground Truth
        </title>
        <desc id="tools-vs-thinking-desc">
          A side-by-side comparison between debugging without tools (open-loop speculation resulting in
          5,000 wasted reasoning tokens and hallucinated root causes) versus debugging with tools
          (closed-loop reality resulting in a 300-token verified pass).
        </desc>
        <defs>
          <marker id="tvt-arr-red" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4.5" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#f87171" />
          </marker>
          <marker id="tvt-arr-green" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4.5" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#34d399" />
          </marker>
        </defs>

        <rect width="960" height="440" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

        <text
          x="480"
          y="28"
          textAnchor="middle"
          fill="#f8fafc"
          fontSize="15"
          fontWeight="700"
          letterSpacing="0.4"
        >
          DEBUGGING CYCLES: INTERNAL SPECULATION VS. DETERMINISTIC GROUND TRUTH
        </text>
        <text x="480" y="46" textAnchor="middle" fill="#94a3b8" fontSize="11.5">
          Deliberation cannot replace observation: why spending reasoning tokens on observable facts is an anti-pattern
        </text>

        {/* LEFT COLUMN: DEBUGGING WITHOUT TOOLS */}
        <g transform="translate(30, 60)">
          <rect width="435" height="308" rx="12" fill="#13080b" stroke="#f87171" strokeWidth="1.5" />
          <path d="M 0 12 Q 0 0 12 0 L 423 0 Q 435 0 435 12 L 435 38 L 0 38 Z" fill="#320f16" />
          <rect x="12" y="8" width="168" height="22" rx="4" fill="#4c141e" />
          <text x="96" y="23" textAnchor="middle" fill="#f87171" fontSize="10.5" fontWeight="800">
            OPEN-LOOP SPECULATION
          </text>
          <text x="190" y="24" fill="#f8fafc" fontSize="13" fontWeight="800">
            DEBUGGING WITHOUT TOOLS
          </text>

          <text x="14" y="52" fill="#fca5a5" fontSize="11" fontWeight="600">
            Model simulates the runtime inside reasoning tokens (unguided drift)
          </text>

          <rect x="14" y="62" width="407" height="26" rx="6" fill="#200d14" stroke="#4c141e" strokeWidth="1" />
          <text x="24" y="79" fill="#f87171" fontSize="10.5" fontWeight="700">1. Hypothesis:</text>
          <text x="110" y="79" fill="#e2e8f0" fontSize="10.5">&quot;Maybe auth token expired in middleware?&quot;</text>

          <line x1="217" y1="88" x2="217" y2="98" stroke="#f87171" strokeWidth="1.5" markerEnd="url(#tvt-arr-red)" />

          <rect x="14" y="98" width="407" height="26" rx="6" fill="#200d14" stroke="#4c141e" strokeWidth="1" />
          <text x="24" y="115" fill="#f87171" fontSize="10.5" fontWeight="700">2. Imagine Path:</text>
          <text x="122" y="115" fill="#e2e8f0" fontSize="10.5">Mentally simulates clock skew without reading code</text>

          <line x1="217" y1="124" x2="217" y2="134" stroke="#f87171" strokeWidth="1.5" markerEnd="url(#tvt-arr-red)" />

          <rect x="14" y="134" width="407" height="26" rx="6" fill="#290e18" stroke="#f87171" strokeWidth="1.2" />
          <text x="24" y="151" fill="#f87171" fontSize="10.5" fontWeight="800">3. &quot;Think Harder&quot;:</text>
          <text x="134" y="151" fill="#fecaca" fontSize="10.5" fontWeight="600">Burns 5,000 tokens inventing race conditions</text>

          <line x1="217" y1="160" x2="217" y2="170" stroke="#f87171" strokeWidth="1.5" markerEnd="url(#tvt-arr-red)" />

          <rect x="14" y="170" width="407" height="26" rx="6" fill="#200d14" stroke="#4c141e" strokeWidth="1" />
          <text x="24" y="187" fill="#f87171" fontSize="10.5" fontWeight="700">4. Speculate:</text>
          <text x="105" y="187" fill="#e2e8f0" fontSize="10.5">Proposes rewrite of network stack for phantom bug</text>

          <line x1="217" y1="196" x2="217" y2="206" stroke="#f87171" strokeWidth="1.5" markerEnd="url(#tvt-arr-red)" />

          <rect x="14" y="206" width="407" height="88" rx="8" fill="#360e17" stroke="#ef4444" strokeWidth="1.5" />
          <text x="24" y="228" fill="#f87171" fontSize="12.5" fontWeight="800">
            ✕ RESULT: HALLUCINATED ROOT CAUSE
          </text>
          <text x="24" y="248" fill="#fca5a5" fontSize="11">
            • 5,000 reasoning tokens wasted on unverified assumptions
          </text>
          <text x="24" y="266" fill="#fca5a5" fontSize="11">
            • Real bug in code remains completely untouched and unfixed
          </text>
          <text x="24" y="284" fill="#f87171" fontSize="10.5" fontWeight="600">
            Status: FAILED — Open-loop speculation loop
          </text>
        </g>

        {/* RIGHT COLUMN: DEBUGGING WITH TOOLS */}
        <g transform="translate(495, 60)">
          <rect width="435" height="308" rx="12" fill="#04160f" stroke="#34d399" strokeWidth="1.5" />
          <path d="M 0 12 Q 0 0 12 0 L 423 0 Q 435 0 435 12 L 435 38 L 0 38 Z" fill="#072d1f" />
          <rect x="12" y="8" width="168" height="22" rx="4" fill="#0c4a32" />
          <text x="96" y="23" textAnchor="middle" fill="#34d399" fontSize="10.5" fontWeight="800">
            CLOSED-LOOP REALITY
          </text>
          <text x="190" y="24" fill="#f8fafc" fontSize="13" fontWeight="800">
            DEBUGGING WITH TOOLS
          </text>

          <text x="14" y="52" fill="#86efac" fontSize="11" fontWeight="600">
            Model queries ground truth with cheap deterministic tool calls
          </text>

          <rect x="14" y="62" width="407" height="26" rx="6" fill="#072016" stroke="#124732" strokeWidth="1" />
          <text x="24" y="79" fill="#34d399" fontSize="10.5" fontWeight="700">1. Hypothesis:</text>
          <text x="110" y="79" fill="#e2e8f0" fontSize="10.5">&quot;Check why auth test is failing&quot;</text>

          <line x1="217" y1="88" x2="217" y2="98" stroke="#34d399" strokeWidth="1.5" markerEnd="url(#tvt-arr-green)" />

          <rect x="14" y="98" width="407" height="26" rx="6" fill="#072016" stroke="#124732" strokeWidth="1" />
          <text x="24" y="115" fill="#34d399" fontSize="10.5" fontWeight="700">2. Inspect Code:</text>
          <text x="126" y="115" fill="#e2e8f0" fontSize="10.5">cat auth.ts | grep verify → missing return statement</text>

          <line x1="217" y1="124" x2="217" y2="134" stroke="#34d399" strokeWidth="1.5" markerEnd="url(#tvt-arr-green)" />

          <rect x="14" y="134" width="407" height="26" rx="6" fill="#072016" stroke="#124732" strokeWidth="1" />
          <text x="24" y="151" fill="#34d399" fontSize="10.5" fontWeight="700">3. Run Test &amp; Observe:</text>
          <text x="160" y="151" fill="#e2e8f0" fontSize="10.5">vitest stderr confirms exact line 42 assertion</text>

          <line x1="217" y1="160" x2="217" y2="170" stroke="#34d399" strokeWidth="1.5" markerEnd="url(#tvt-arr-green)" />

          <rect x="14" y="170" width="407" height="26" rx="6" fill="#0a3321" stroke="#34d399" strokeWidth="1.2" />
          <text x="24" y="187" fill="#34d399" fontSize="10.5" fontWeight="800">4. Patch &amp; Re-run Test:</text>
          <text x="175" y="187" fill="#a7f3d0" fontSize="10.5" fontWeight="600">Applies 1-line return fix → vitest passes in 110ms</text>

          <line x1="217" y1="196" x2="217" y2="206" stroke="#34d399" strokeWidth="1.5" markerEnd="url(#tvt-arr-green)" />

          <rect x="14" y="206" width="407" height="88" rx="8" fill="#083824" stroke="#10b981" strokeWidth="1.5" />
          <text x="24" y="228" fill="#34d399" fontSize="12.5" fontWeight="800">
            ✓ PASS [STOP] — VERIFIED GROUND TRUTH
          </text>
          <text x="24" y="248" fill="#a7f3d0" fontSize="11">
            • 300 tokens used (94% compute discount vs internal simulation)
          </text>
          <text x="24" y="266" fill="#a7f3d0" fontSize="11">
            • Zero guesswork: backed by deterministic test runner receipt
          </text>
          <text x="24" y="284" fill="#34d399" fontSize="10.5" fontWeight="600">
            Status: RESOLVED — Execution halted immediately on green
          </text>
        </g>

        {/* Central Bottom Banner */}
        <g id="tvt-banner" transform="translate(30, 378)">
          <rect width="900" height="36" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="20" cy="18" r="4" fill="#38bdf8" />
          <text x="450" y="23" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="800" letterSpacing="0.3">
            PRINCIPLE: &quot;When reality can cheaply answer the question, ask reality.&quot;
          </text>
          <circle cx="880" cy="18" r="4" fill="#38bdf8" />
        </g>

        <text x="480" y="428" textAnchor="middle" fill="#64748b" fontSize="10.5">
          Illustrative · scenario comparison between ungrounded internal deliberation and tool-augmented debugging
        </text>
      </svg>
      </div>
      <div className="blog-svg-mobile">
        <MobileFigureToolsVsThinking />
      </div>
    </figure>
  );
}

function FigureSweetSpotCurve() {
  return (
    <figure className="blog-post-figure" style={{ margin: "32px 0" }}>
      <div className="blog-svg-desktop">
        <svg
          viewBox="0 0 960 480"
        role="img"
        aria-labelledby="sweet-spot-title sweet-spot-desc"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title id="sweet-spot-title">The Inverted-U Curve of Reasoning Effort</title>
        <desc id="sweet-spot-desc">
          Solution quality versus reasoning effort inverted-U curve with under-thinking on the left,
          the sweet spot of minimum sufficient deliberation at the peak, and the overthinking cascade on the right.
        </desc>

        <defs>
          <linearGradient id="sweetSpotAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.22" />
            <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#05060a" stopOpacity="0.0" />
          </linearGradient>

          <linearGradient id="sweetSpotStrokeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="22%" stopColor="#fbbf24" />
            <stop offset="42%" stopColor="#34d399" />
            <stop offset="68%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>

          <marker id="sweetSpotAxisArrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 1 1 L 7 4 L 1 7 Z" fill="#64748b" />
          </marker>

          <marker id="sweetSpotCascadeArrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 1 1 L 7 4 L 1 7 Z" fill="#475569" />
          </marker>
        </defs>

        <rect width="960" height="480" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

        <text x="480" y="30" textAnchor="middle" fill="#f8fafc" fontSize="18" fontWeight="700">
          The Inverted-U Curve of Reasoning Effort
        </text>
        <text x="480" y="50" textAnchor="middle" fill="#94a3b8" fontSize="12">
          Why test-time compute follows diminishing and negative returns without empirical grounding
        </text>

        {/* Zone 1: Too Little */}
        <rect
          x="75"
          y="68"
          width="235"
          height="237"
          rx="8"
          fill="#f87171"
          fillOpacity="0.04"
          stroke="#f87171"
          strokeOpacity="0.16"
          strokeDasharray="4 4"
        />
        <rect x="85" y="78" width="138" height="20" rx="4" fill="#450a0a" stroke="#f87171" strokeOpacity="0.4" />
        <text x="154" y="92" textAnchor="middle" fill="#f87171" fontSize="10.5" fontWeight="700">
          ZONE 1: TOO LITTLE
        </text>
        <text x="88" y="118" fill="#fca5a5" fontSize="11.5" fontWeight="600">
          Under-Deliberation
        </text>
        <text x="88" y="136" fill="#94a3b8" fontSize="11">
          • Shallow single-pass execution
        </text>
        <text x="88" y="154" fill="#94a3b8" fontSize="11">
          • Undetected race conditions
        </text>
        <text x="88" y="172" fill="#94a3b8" fontSize="11">
          • Premature victory bias
        </text>

        {/* Zone 2: Sweet Spot */}
        <rect
          x="320"
          y="68"
          width="200"
          height="237"
          rx="8"
          fill="#34d399"
          fillOpacity="0.05"
          stroke="#34d399"
          strokeOpacity="0.25"
          strokeDasharray="4 4"
        />
        <rect x="330" y="78" width="180" height="20" rx="4" fill="#064e3b" stroke="#34d399" strokeOpacity="0.5" />
        <text x="420" y="92" textAnchor="middle" fill="#34d399" fontSize="10.5" fontWeight="700">
          ZONE 2: SWEET SPOT
        </text>
        <text x="335" y="142" fill="#a7f3d0" fontSize="11.5" fontWeight="600">
          Minimum Sufficient
        </text>
        <text x="335" y="160" fill="#94a3b8" fontSize="11">
          • Verified against facts &amp; tests
        </text>
        <text x="335" y="178" fill="#94a3b8" fontSize="11">
          • Branch synthesis complete
        </text>
        <text x="335" y="196" fill="#94a3b8" fontSize="11">
          • Highest compute ROI
        </text>

        {/* Zone 3: Overthinking */}
        <rect
          x="530"
          y="68"
          width="355"
          height="237"
          rx="8"
          fill="#ec4899"
          fillOpacity="0.04"
          stroke="#ec4899"
          strokeOpacity="0.16"
          strokeDasharray="4 4"
        />
        <rect x="540" y="78" width="170" height="20" rx="4" fill="#4a0429" stroke="#ec4899" strokeOpacity="0.4" />
        <text x="625" y="92" textAnchor="middle" fill="#ec4899" fontSize="10.5" fontWeight="700">
          ZONE 3: OVERTHINKING
        </text>
        <text x="545" y="118" fill="#f472b6" fontSize="11.5" fontWeight="600">
          Negative Compute Returns
        </text>
        <text x="545" y="136" fill="#94a3b8" fontSize="11">
          • Ruminates on already-settled decisions
        </text>
        <text x="545" y="154" fill="#94a3b8" fontSize="11">
          • Hallucinates phantom edge cases
        </text>
        <text x="545" y="172" fill="#94a3b8" fontSize="11">
          • Paralyzing self-doubt scraps working code
        </text>

        {/* Axes */}
        <line x1="75" y1="280" x2="75" y2="72" stroke="#475569" strokeWidth="1.5" markerEnd="url(#sweetSpotAxisArrow)" />
        <text x="80" y="64" fill="#cbd5e1" fontSize="11" fontWeight="600">
          ▲ Solution Quality &amp; Reliability
        </text>

        <line x1="75" y1="280" x2="885" y2="280" stroke="#475569" strokeWidth="1.5" markerEnd="url(#sweetSpotAxisArrow)" />
        <text x="885" y="274" textAnchor="end" fill="#cbd5e1" fontSize="11" fontWeight="600">
          Reasoning Effort / Search Budget ►
        </text>

        <text x="100" y="296" textAnchor="middle" fill="#94a3b8" fontSize="11">None</text>
        <text x="220" y="296" textAnchor="middle" fill="#94a3b8" fontSize="11">Low</text>
        <text x="420" y="296" textAnchor="middle" fill="#34d399" fontSize="11.5" fontWeight="700">
          Medium (Optimal)
        </text>
        <text x="630" y="296" textAnchor="middle" fill="#fca5a5" fontSize="11">High</text>
        <text x="830" y="296" textAnchor="middle" fill="#f43f5e" fontSize="11" fontWeight="600">Max</text>

        {/* Shaded Area */}
        <path
          d="M 95 260 C 180 250, 250 150, 390 114 C 420 105, 450 107, 490 116 C 570 138, 670 195, 760 235 C 810 252, 850 258, 875 260 L 875 280 L 95 280 Z"
          fill="url(#sweetSpotAreaGrad)"
        />

        {/* Curve Path */}
        <path
          d="M 95 260 C 180 250, 250 150, 390 114 C 420 105, 450 107, 490 116 C 570 138, 670 195, 760 235 C 810 252, 850 258, 875 260"
          fill="none"
          stroke="url(#sweetSpotStrokeGrad)"
          strokeWidth="3.5"
        />

        {/* Sweet Spot Marker */}
        <circle cx="420" cy="107" r="18" fill="#34d399" fillOpacity="0.16" />
        <circle cx="420" cy="107" r="9" fill="#34d399" fillOpacity="0.38" />
        <circle cx="420" cy="107" r="5" fill="#f8fafc" stroke="#34d399" strokeWidth="2.5" />

        <rect x="300" y="74" width="240" height="24" rx="12" fill="#064e3b" stroke="#34d399" strokeWidth="1.2" />
        <circle cx="314" cy="86" r="4" fill="#34d399" />
        <text x="420" y="90" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="700">
          ★ SWEET SPOT: Minimum Sufficient Deliberation
        </text>

        {/* Lower Section: The Overthinking Cascade */}
        <rect x="25" y="322" width="910" height="126" rx="10" fill="#090d16" stroke="#1e293b" strokeWidth="1" />

        <text x="40" y="342" fill="#ec4899" fontSize="11" fontWeight="700" letterSpacing="0.8">
          THE OVERTHINKING CASCADE
        </text>
        <text x="215" y="342" fill="#94a3b8" fontSize="11">
          How excessive reasoning tokens unseat correct solutions without external test verification
        </text>

        {/* Step 1 */}
        <g transform="translate(42, 354)">
          <rect width="106" height="82" rx="6" fill="#064e3b" fillOpacity="0.6" stroke="#34d399" strokeWidth="1.2" />
          <text x="53" y="18" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="700">
            1. Correct Idea
          </text>
          <text x="53" y="34" textAnchor="middle" fill="#a7f3d0" fontSize="10.5">
            Discovers sound
          </text>
          <text x="53" y="48" textAnchor="middle" fill="#a7f3d0" fontSize="10.5">
            logic &amp; invariant
          </text>
          <rect x="18" y="58" width="70" height="16" rx="3" fill="#022c22" />
          <text x="53" y="70" textAnchor="middle" fill="#34d399" fontSize="9.5" fontWeight="600">
            Tokens: ~500
          </text>
        </g>
        <line x1="149" y1="395" x2="168" y2="395" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#sweetSpotCascadeArrow)" />

        {/* Step 2 */}
        <g transform="translate(170, 354)">
          <rect width="106" height="82" rx="6" fill="#082f49" fillOpacity="0.6" stroke="#38bdf8" strokeWidth="1.2" />
          <text x="53" y="18" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="700">
            2. Double-Check
          </text>
          <text x="53" y="34" textAnchor="middle" fill="#bae6fd" fontSize="10.5">
            Audits code
          </text>
          <text x="53" y="48" textAnchor="middle" fill="#bae6fd" fontSize="10.5">
            and constraints
          </text>
          <rect x="18" y="58" width="70" height="16" rx="3" fill="#0c2338" />
          <text x="53" y="70" textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="600">
            Tokens: ~1.2k
          </text>
        </g>
        <line x1="277" y1="395" x2="296" y2="395" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#sweetSpotCascadeArrow)" />

        {/* Step 3 */}
        <g transform="translate(298, 354)">
          <rect width="106" height="82" rx="6" fill="#064e3b" fillOpacity="0.6" stroke="#34d399" strokeWidth="1.2" />
          <text x="53" y="18" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="700">
            3. Still Correct
          </text>
          <text x="53" y="34" textAnchor="middle" fill="#a7f3d0" fontSize="10.5">
            Solution holds;
          </text>
          <text x="53" y="48" textAnchor="middle" fill="#a7f3d0" fontSize="10.5">
            optimal exit point
          </text>
          <rect x="18" y="58" width="70" height="16" rx="3" fill="#022c22" />
          <text x="53" y="70" textAnchor="middle" fill="#34d399" fontSize="9.5" fontWeight="600">
            Optimal Exit
          </text>
        </g>
        <line x1="405" y1="395" x2="424" y2="395" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#sweetSpotCascadeArrow)" />

        {/* Step 4 */}
        <g transform="translate(426, 354)">
          <rect width="106" height="82" rx="6" fill="#451a03" fillOpacity="0.6" stroke="#fbbf24" strokeWidth="1.2" />
          <text x="53" y="18" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="700">
            4. &quot;But What If...&quot;
          </text>
          <text x="53" y="34" textAnchor="middle" fill="#fde68a" fontSize="10.5">
            Unprompted
          </text>
          <text x="53" y="48" textAnchor="middle" fill="#fde68a" fontSize="10.5">
            self-doubt begins
          </text>
          <rect x="18" y="58" width="70" height="16" rx="3" fill="#2d1602" />
          <text x="53" y="70" textAnchor="middle" fill="#fbbf24" fontSize="9.5" fontWeight="600">
            Tokens: ~4k
          </text>
        </g>
        <line x1="533" y1="395" x2="552" y2="395" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#sweetSpotCascadeArrow)" />

        {/* Step 5 */}
        <g transform="translate(554, 354)">
          <rect width="106" height="82" rx="6" fill="#431407" fillOpacity="0.6" stroke="#f97316" strokeWidth="1.2" />
          <text x="53" y="18" textAnchor="middle" fill="#f97316" fontSize="11" fontWeight="700">
            5. Phantom Edge
          </text>
          <text x="53" y="34" textAnchor="middle" fill="#fdba74" fontSize="10.5">
            Invents phantom
          </text>
          <text x="53" y="48" textAnchor="middle" fill="#fdba74" fontSize="10.5">
            impossible bugs
          </text>
          <rect x="18" y="58" width="70" height="16" rx="3" fill="#2c0f05" />
          <text x="53" y="70" textAnchor="middle" fill="#f97316" fontSize="9.5" fontWeight="600">
            Tokens: ~8k
          </text>
        </g>
        <line x1="661" y1="395" x2="680" y2="395" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#sweetSpotCascadeArrow)" />

        {/* Step 6 */}
        <g transform="translate(682, 354)">
          <rect width="106" height="82" rx="6" fill="#450a0a" fillOpacity="0.6" stroke="#f87171" strokeWidth="1.2" />
          <text x="53" y="18" textAnchor="middle" fill="#f87171" fontSize="11" fontWeight="700">
            6. Reopen Choice
          </text>
          <text x="53" y="34" textAnchor="middle" fill="#fca5a5" fontSize="10.5">
            Reopens settled
          </text>
          <text x="53" y="48" textAnchor="middle" fill="#fca5a5" fontSize="10.5">
            decision &amp; code
          </text>
          <rect x="18" y="58" width="70" height="16" rx="3" fill="#2d0808" />
          <text x="53" y="70" textAnchor="middle" fill="#f87171" fontSize="9.5" fontWeight="600">
            Decision Churn
          </text>
        </g>
        <line x1="789" y1="395" x2="808" y2="395" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#sweetSpotCascadeArrow)" />

        {/* Step 7 */}
        <g transform="translate(810, 354)">
          <rect width="106" height="82" rx="6" fill="#4c0519" fillOpacity="0.6" stroke="#f43f5e" strokeWidth="1.2" />
          <text x="53" y="18" textAnchor="middle" fill="#f43f5e" fontSize="11" fontWeight="700">
            7. Wrong Answer
          </text>
          <text x="53" y="34" textAnchor="middle" fill="#fda4af" fontSize="10.5">
            Submits fragile,
          </text>
          <text x="53" y="48" textAnchor="middle" fill="#fda4af" fontSize="10.5">
            regressed patch
          </text>
          <rect x="18" y="58" width="70" height="16" rx="3" fill="#2c0510" />
          <text x="53" y="70" textAnchor="middle" fill="#f43f5e" fontSize="9.5" fontWeight="600">
            Tokens: ~16k
          </text>
        </g>

        <text x="480" y="464" textAnchor="middle" fill="#64748b" fontSize="11">
          Illustrative · Test-time compute scaling dynamics and reasoning saturation · Gaia Research
        </text>
      </svg>
      </div>
      <div className="blog-svg-mobile">
        <MobileFigureSweetSpotCurve />
      </div>
    </figure>
  );
}

function FigureEscalationLadder() {
  return (
    <figure className="blog-post-figure" style={{ margin: "32px 0" }}>
      <div className="blog-svg-desktop">
        <svg
          viewBox="0 0 900 460"
        role="img"
        aria-labelledby="escalation-ladder-title escalation-ladder-desc"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title id="escalation-ladder-title">The Reasoning Escalation Ladder: Empirical Decision Flow</title>
        <desc id="escalation-ladder-desc">
          Flowchart showing how agents should allocate reasoning effort: retrieve external facts first,
          select a search budget rung based on uncertainty, and only escalate to high or max with empirical compiler/eval evidence.
        </desc>

        <defs>
          <marker id="ladderArrowCyan" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 1 1 L 7 4 L 1 7 Z" fill="#38bdf8" />
          </marker>
          <marker id="ladderArrowSlate" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 1 1 L 7 4 L 1 7 Z" fill="#64748b" />
          </marker>
          <marker id="ladderArrowEmerald" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 1 1 L 7 4 L 1 7 Z" fill="#34d399" />
          </marker>
          <marker id="ladderArrowRose" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 1 1 L 7 4 L 1 7 Z" fill="#ec4899" />
          </marker>
        </defs>

        <rect width="900" height="460" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

        <text x="450" y="30" textAnchor="middle" fill="#f8fafc" fontSize="18" fontWeight="700">
          The Reasoning Escalation Ladder: Empirical Decision Flow
        </text>
        <text x="450" y="50" textAnchor="middle" fill="#94a3b8" fontSize="12">
          Evidence first. Escalation second. Allocate search budget based on residual uncertainty.
        </text>

        {/* Phase 1 Grounding Gate */}
        <rect x="25" y="68" width="250" height="310" rx="10" fill="#0b0f19" stroke="#1e293b" strokeWidth="1.2" />
        <text x="40" y="92" fill="#38bdf8" fontSize="11" fontWeight="700" letterSpacing="0.6">
          PHASE 1: GROUNDING GATE
        </text>

        <rect x="40" y="106" width="220" height="38" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
        <text x="150" y="130" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="700">
          NEW TASK / SPECIFICATION
        </text>

        <line x1="150" y1="144" x2="150" y2="168" stroke="#38bdf8" strokeWidth="1.5" markerEnd="url(#ladderArrowCyan)" />

        <polygon points="150,170 235,204 150,238 65,204" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
        <text x="150" y="199" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="700">
          Need external
        </text>
        <text x="150" y="214" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="700">
          information?
        </text>

        <line x1="150" y1="238" x2="150" y2="265" stroke="#38bdf8" strokeWidth="1.5" markerEnd="url(#ladderArrowCyan)" />
        <rect x="134" y="244" width="32" height="16" rx="3" fill="#0369a1" />
        <text x="150" y="256" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="700">
          YES
        </text>

        <rect x="40" y="265" width="220" height="74" rx="6" fill="#082f49" stroke="#38bdf8" strokeWidth="1.5" />
        <text x="150" y="286" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="700">
          RETRIEVE (Tool Use)
        </text>
        <text x="150" y="303" textAnchor="middle" fill="#cbd5e1" fontSize="11">
          read_file · grep · docs · bash
        </text>
        <text x="150" y="321" textAnchor="middle" fill="#94a3b8" fontSize="11">
          Acquire ground truth facts
        </text>

        <path
          d="M 260 302 C 280 302, 282 240, 282 204 C 282 170, 288 150, 305 150"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          markerEnd="url(#ladderArrowCyan)"
        />

        <line x1="235" y1="204" x2="295" y2="204" stroke="#34d399" strokeWidth="1.5" markerEnd="url(#ladderArrowEmerald)" />
        <rect x="246" y="196" width="28" height="16" rx="3" fill="#065f46" />
        <text x="260" y="208" textAnchor="middle" fill="#a7f3d0" fontSize="10" fontWeight="700">
          NO
        </text>

        {/* Phase 2 Uncertainty Calibration */}
        <rect x="295" y="68" width="310" height="310" rx="10" fill="#0b0f19" stroke="#1e293b" strokeWidth="1.2" />
        <text x="310" y="92" fill="#fbbf24" fontSize="11" fontWeight="700" letterSpacing="0.6">
          PHASE 2: CALIBRATE SEARCH BUDGET
        </text>
        <text x="310" y="108" fill="#cbd5e1" fontSize="11">
          How much inferential uncertainty is unresolved?
        </text>

        <g transform="translate(310, 118)">
          <rect width="280" height="60" rx="6" fill="#030712" stroke="#38bdf8" strokeWidth="1.2" />
          <rect x="8" y="8" width="46" height="18" rx="3" fill="#082f49" />
          <text x="31" y="21" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="700">
            LOW
          </text>
          <text x="62" y="22" fill="#f8fafc" fontSize="11.5" fontWeight="700">
            Shallow Uncertainty
          </text>
          <text x="270" y="21" textAnchor="end" fill="#38bdf8" fontSize="10.5">
            0 – 1k tokens
          </text>
          <text x="10" y="44" fill="#94a3b8" fontSize="11">
            Tiny edits, typos, syntax fixes, routine boilerplate
          </text>
        </g>

        <g transform="translate(310, 186)">
          <rect width="280" height="60" rx="6" fill="#030712" stroke="#34d399" strokeWidth="1.2" />
          <rect x="8" y="8" width="58" height="18" rx="3" fill="#064e3b" />
          <text x="37" y="21" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="700">
            MEDIUM
          </text>
          <text x="74" y="22" fill="#f8fafc" fontSize="11.5" fontWeight="700">
            Moderate Uncertainty
          </text>
          <text x="270" y="21" textAnchor="end" fill="#34d399" fontSize="10.5">
            1k – 4k tokens
          </text>
          <text x="10" y="44" fill="#94a3b8" fontSize="11">
            Multi-file features, standard debugging, unit tests
          </text>
        </g>

        <g transform="translate(310, 254)">
          <rect width="280" height="60" rx="6" fill="#030712" stroke="#fbbf24" strokeWidth="1.2" />
          <rect x="8" y="8" width="50" height="18" rx="3" fill="#451a03" />
          <text x="33" y="21" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="700">
            HIGH
          </text>
          <text x="66" y="22" fill="#f8fafc" fontSize="11.5" fontWeight="700">
            Deep Uncertainty
          </text>
          <text x="270" y="21" textAnchor="end" fill="#fbbf24" fontSize="10.5">
            4k – 16k tokens
          </text>
          <text x="10" y="44" fill="#94a3b8" fontSize="11">
            Root-cause analysis, complex concurrency &amp; architecture
          </text>
        </g>

        <text x="450" y="336" textAnchor="middle" fill="#64748b" fontSize="11">
          Rule: Default to lowest sufficient rung · escalate only with cause
        </text>

        <line x1="590" y1="216" x2="625" y2="124" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ladderArrowSlate)" />

        {/* Phase 3 Empirical Gate */}
        <rect x="625" y="68" width="250" height="310" rx="10" fill="#0b0f19" stroke="#1e293b" strokeWidth="1.2" />
        <text x="640" y="92" fill="#ec4899" fontSize="11" fontWeight="700" letterSpacing="0.6">
          PHASE 3: EMPIRICAL GATE
        </text>

        <rect x="640" y="106" width="220" height="36" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="1.2" />
        <text x="750" y="129" textAnchor="middle" fill="#f8fafc" fontSize="11.5" fontWeight="700">
          RUN TESTS &amp; COMPILER
        </text>

        <line x1="750" y1="142" x2="750" y2="168" stroke="#ec4899" strokeWidth="1.5" markerEnd="url(#ladderArrowRose)" />

        <polygon points="750,170 838,204 750,238 662,204" fill="#0f172a" stroke="#ec4899" strokeWidth="1.5" />
        <text x="750" y="199" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="700">
          Still stuck after
        </text>
        <text x="750" y="214" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="700">
          empirical run?
        </text>

        {/* [NO] -> STOP & SHIP */}
        <path
          d="M 662 204 L 642 204 L 642 244 L 678 244 L 678 258"
          fill="none"
          stroke="#34d399"
          strokeWidth="1.5"
          markerEnd="url(#ladderArrowEmerald)"
        />
        <rect x="636" y="258" width="106" height="92" rx="6" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" />
        <rect x="644" y="266" width="46" height="18" rx="3" fill="#022c22" />
        <text x="667" y="279" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="700">
          [NO]
        </text>
        <text x="689" y="303" textAnchor="middle" fill="#34d399" fontSize="12" fontWeight="800">
          STOP &amp; SHIP
        </text>
        <text x="689" y="321" textAnchor="middle" fill="#cbd5e1" fontSize="11">
          Verified Clean
        </text>
        <text x="689" y="338" textAnchor="middle" fill="#a7f3d0" fontSize="10">
          Do not overthink
        </text>

        {/* [YES] -> XHIGH / MAX */}
        <path
          d="M 838 204 L 858 204 L 858 244 L 822 244 L 822 258"
          fill="none"
          stroke="#ec4899"
          strokeWidth="1.5"
          markerEnd="url(#ladderArrowRose)"
        />
        <rect x="754" y="258" width="106" height="92" rx="6" fill="#4c0519" stroke="#ec4899" strokeWidth="1.5" />
        <rect x="762" y="266" width="46" height="18" rx="3" fill="#2d0612" />
        <text x="785" y="279" textAnchor="middle" fill="#ec4899" fontSize="10" fontWeight="700">
          [YES]
        </text>
        <text x="807" y="303" textAnchor="middle" fill="#ec4899" fontSize="12" fontWeight="800">
          XHIGH / MAX
        </text>
        <text x="807" y="321" textAnchor="middle" fill="#cbd5e1" fontSize="11">
          Escalate Effort
        </text>
        <text x="807" y="338" textAnchor="middle" fill="#fda4af" fontSize="10">
          Feed error trace
        </text>

        {/* Bottom Callout Banner */}
        <rect x="25" y="392" width="850" height="44" rx="8" fill="#090d16" stroke="#fbbf24" strokeWidth="1.2" />
        <text
          x="450"
          y="412"
          textAnchor="middle"
          fill="#fbbf24"
          fontSize="12"
          fontWeight="800"
          letterSpacing="0.8"
        >
          EVIDENCE FIRST. ESCALATION SECOND.
        </text>
        <text x="450" y="427" textAnchor="middle" fill="#cbd5e1" fontSize="11">
          Never escalate to high/max effort on intuition. Ground the model with compiler errors, tests, or docs first.
        </text>

        <text x="450" y="452" textAnchor="middle" fill="#64748b" fontSize="11">
          Illustrative · Autonomous agent search budget escalation policy · Gaia Research
        </text>
      </svg>
      </div>
      <div className="blog-svg-mobile">
        <MobileFigureEscalationLadder />
      </div>
    </figure>
  );
}

function FigureThreeAgents() {
  return (
    <figure className="blog-post-figure" style={{ margin: "32px 0" }}>
      <div className="blog-svg-desktop">
        <svg
          viewBox="0 0 960 460"
        role="img"
        aria-labelledby="three-agents-title three-agents-desc"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title id="three-agents-title">Three Agents Encounter an Unfamiliar API</title>
        <desc id="three-agents-desc">
          Comparison of three agent strategies: Agent A with unchecked confidence produces a broken build;
          Agent B with 12,000 blind reasoning tokens creates an expensive failure; and Agent C with grounded deliberation passes on the first try.
        </desc>

        <rect width="960" height="460" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

        <text x="480" y="28" textAnchor="middle" fill="#f8fafc" fontSize="18" fontWeight="700">
          Three Agents Encounter an Unfamiliar API
        </text>
        <text x="480" y="48" textAnchor="middle" fill="#94a3b8" fontSize="12">
          Why blind reasoning effort cannot substitute for missing empirical context
        </text>

        {/* Card A: Agent A */}
        <g transform="translate(25, 65)">
          <rect width="286" height="336" rx="12" fill="#090d16" stroke="#f87171" strokeWidth="1.2" />
          <rect width="286" height="38" rx="12" fill="#2d0a0a" />
          <rect y="26" width="286" height="12" fill="#2d0a0a" />
          <text x="143" y="24" textAnchor="middle" fill="#f87171" fontSize="11.5" fontWeight="700">
            AGENT A · UNCHECKED CONFIDENCE
          </text>

          <rect x="12" y="46" width="180" height="18" rx="3" fill="#450a0a" />
          <text x="102" y="59" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="700">
            Low Effort · Zero Retrieval
          </text>

          <rect x="12" y="70" width="262" height="44" rx="6" fill="#150a0a" stroke="#f87171" strokeOpacity="0.3" />
          <text x="22" y="87" fill="#fca5a5" fontSize="11" fontStyle="italic">
            &quot;I probably know this API. Let me just
          </text>
          <text x="22" y="103" fill="#fca5a5" fontSize="11" fontStyle="italic">
            write the code directly.&quot;
          </text>

          <g transform="translate(12, 122)">
            <rect y="0" width="262" height="24" rx="4" fill="#0f172a" />
            <text x="10" y="16" fill="#cbd5e1" fontSize="11">
              1. Skip docs, grep, and tools
            </text>

            <rect y="28" width="262" height="24" rx="4" fill="#0f172a" />
            <text x="10" y="44" fill="#cbd5e1" fontSize="11">
              2. Single-pass generation (0 reasoning)
            </text>

            <rect y="56" width="262" height="24" rx="4" fill="#0f172a" />
            <text x="10" y="72" fill="#f87171" fontSize="11">
              3. Hallucinate fictitious API method
            </text>
          </g>

          <rect x="12" y="210" width="262" height="114" rx="8" fill="#1a0808" stroke="#f87171" strokeWidth="1.2" />
          <rect x="22" y="218" width="105" height="20" rx="4" fill="#7f1d1d" />
          <text x="74" y="232" textAnchor="middle" fill="#fee2e2" fontSize="10.5" fontWeight="700">
            BROKEN BUILD
          </text>
          <text x="22" y="254" fill="#f87171" fontSize="12" fontWeight="700">
            Instant Runtime Crash
          </text>
          <text x="22" y="271" fill="#cbd5e1" fontSize="11">
            Latency: 1.2s · Tokens: 350 · Cost: $0.001
          </text>
          <text x="22" y="289" fill="#fca5a5" fontSize="11">
            TypeError: client.fetchTree is not a function
          </text>
          <text x="22" y="308" fill="#94a3b8" fontSize="10.5">
            Confidence without facts guarantees failure.
          </text>
        </g>

        {/* Card B: Agent B */}
        <g transform="translate(337, 65)">
          <rect width="286" height="336" rx="12" fill="#090d16" stroke="#fbbf24" strokeWidth="1.2" />
          <rect width="286" height="38" rx="12" fill="#2d1a03" />
          <rect y="26" width="286" height="12" fill="#2d1a03" />
          <text x="143" y="24" textAnchor="middle" fill="#fbbf24" fontSize="11.5" fontWeight="700">
            AGENT B · BLIND COMPUTE WASTE
          </text>

          <rect x="12" y="46" width="165" height="18" rx="3" fill="#451a03" />
          <text x="94" y="59" textAnchor="middle" fill="#fde68a" fontSize="10" fontWeight="700">
            Max Effort · Zero Retrieval
          </text>

          <rect x="12" y="70" width="262" height="44" rx="6" fill="#181205" stroke="#fbbf24" strokeOpacity="0.3" />
          <text x="22" y="87" fill="#fde68a" fontSize="11" fontStyle="italic">
            &quot;I should think harder! Let me deduce
          </text>
          <text x="22" y="103" fill="#fde68a" fontSize="11" fontStyle="italic">
            the API shape from first principles.&quot;
          </text>

          <g transform="translate(12, 122)">
            <rect y="0" width="262" height="24" rx="4" fill="#0f172a" />
            <text x="10" y="16" fill="#cbd5e1" fontSize="11">
              1. Spend 12,000 reasoning tokens
            </text>

            <rect y="28" width="262" height="24" rx="4" fill="#0f172a" />
            <text x="10" y="44" fill="#cbd5e1" fontSize="11">
              2. Deduce complex phantom interfaces
            </text>

            <rect y="56" width="262" height="24" rx="4" fill="#0f172a" />
            <text x="10" y="72" fill="#fbbf24" fontSize="11">
              3. Hallucinate API, but thoughtfully
            </text>
          </g>

          <rect x="12" y="210" width="262" height="114" rx="8" fill="#1c1304" stroke="#fbbf24" strokeWidth="1.2" />
          <rect x="22" y="218" width="138" height="20" rx="4" fill="#78350f" />
          <text x="91" y="232" textAnchor="middle" fill="#fef3c7" fontSize="10.5" fontWeight="700">
            EXPENSIVE FAILURE
          </text>
          <text x="22" y="254" fill="#fbbf24" fontSize="12" fontWeight="700">
            Thoughtful Hallucination
          </text>
          <text x="22" y="271" fill="#cbd5e1" fontSize="11">
            Latency: 32.5s · Tokens: 12,400 · Cost: $0.18
          </text>
          <text x="22" y="289" fill="#fde68a" fontSize="11">
            Error: Module has no exported member &apos;v2&apos;
          </text>
          <text x="22" y="308" fill="#94a3b8" fontSize="10.5">
            Reasoning cannot fabricate absent facts.
          </text>
        </g>

        {/* Card C: Agent C */}
        <g transform="translate(649, 65)">
          <rect width="286" height="336" rx="12" fill="#090d16" stroke="#34d399" strokeWidth="1.2" />
          <rect width="286" height="38" rx="12" fill="#063520" />
          <rect y="26" width="286" height="12" fill="#063520" />
          <text x="143" y="24" textAnchor="middle" fill="#34d399" fontSize="11.5" fontWeight="700">
            AGENT C · GROUNDED DELIBERATION
          </text>

          <rect x="12" y="46" width="190" height="18" rx="3" fill="#064e3b" />
          <text x="107" y="59" textAnchor="middle" fill="#a7f3d0" fontSize="10" fontWeight="700">
            Calibrated Effort + Tool Retrieval
          </text>

          <rect x="12" y="70" width="262" height="44" rx="6" fill="#062217" stroke="#34d399" strokeOpacity="0.3" />
          <text x="22" y="87" fill="#a7f3d0" fontSize="11" fontStyle="italic">
            &quot;Do I know the API? Nope. Let me
          </text>
          <text x="22" y="103" fill="#a7f3d0" fontSize="11" fontStyle="italic">
            fetch docs &amp; verify the version first.&quot;
          </text>

          <g transform="translate(12, 122)">
            <rect y="0" width="262" height="24" rx="4" fill="#0f172a" />
            <text x="10" y="16" fill="#38bdf8" fontSize="11">
              1. Tool: read_file &amp; docs (250ms)
            </text>

            <rect y="28" width="262" height="24" rx="4" fill="#0f172a" />
            <text x="10" y="44" fill="#34d399" fontSize="11">
              2. Calibrated reasoning (1.2k tokens)
            </text>

            <rect y="56" width="262" height="24" rx="4" fill="#0f172a" />
            <text x="10" y="72" fill="#34d399" fontSize="11">
              3. Implement &amp; run compiler check
            </text>
          </g>

          <rect x="12" y="210" width="262" height="114" rx="8" fill="#05281b" stroke="#34d399" strokeWidth="1.2" />
          <rect x="22" y="218" width="125" height="20" rx="4" fill="#065f46" />
          <text x="84" y="232" textAnchor="middle" fill="#d1fae5" fontSize="10.5" fontWeight="700">
            PASSES FIRST TRY
          </text>
          <text x="22" y="254" fill="#34d399" fontSize="12" fontWeight="700">
            Clean Verified Execution
          </text>
          <text x="22" y="271" fill="#cbd5e1" fontSize="11">
            Latency: 4.2s · Tokens: 1,600 · Cost: $0.015
          </text>
          <text x="22" y="289" fill="#a7f3d0" fontSize="11">
            Status: 14/14 tests pass · 0 regressions
          </text>
          <text x="22" y="308" fill="#94a3b8" fontSize="10.5">
            Empirical facts + calibrated reasoning wins.
          </text>
        </g>

        {/* Bottom Banner */}
        <rect x="25" y="410" width="910" height="34" rx="8" fill="#0b1329" stroke="#38bdf8" strokeWidth="1" />
        <text x="480" y="432" textAnchor="middle" fontSize="12">
          <tspan fill="#f8fafc" fontWeight="600">Key Takeaway: Agent C didn&apos;t have more raw intelligence. </tspan>
          <tspan fill="#34d399" fontWeight="800">It allocated intelligence better.</tspan>
        </text>

        <text x="480" y="453" textAnchor="middle" fill="#64748b" fontSize="11">
          Illustrative · Grounded retrieval vs. blind deliberation scaling scenario · Gaia Research
        </text>
      </svg>
      </div>
      <div className="blog-svg-mobile">
        <MobileFigureThreeAgents />
      </div>
    </figure>
  );
}

function FigureSummaryLoop() {
  return (
    <figure className="blog-post-figure" style={{ margin: "32px 0" }}>
      <div className="blog-svg-desktop">
        <svg
          viewBox="0 0 900 380"
        role="img"
        aria-labelledby="summary-loop-title summary-loop-desc"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title id="summary-loop-title">The Whole Article in One Diagram: The Deliberation Lifecycle</title>
        <desc id="summary-loop-desc">
          Five-step sequential policy flow: Step 1 Missing Fact triggers Retrieve; Step 2 Hard Inference triggers Reason;
          Step 3 Not Sure triggers Verify; Step 4 Still Stuck triggers Increase Effort; Step 5 Resolved triggers Stop and Ship.
        </desc>

        <defs>
          <marker id="summaryArrowCyan" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 1 1 L 7 4 L 1 7 Z" fill="#38bdf8" />
          </marker>
          <marker id="summaryArrowPink" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 1 1 L 7 4 L 1 7 Z" fill="#ec4899" />
          </marker>
          <marker id="summaryArrowEmerald" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 1 1 L 7 4 L 1 7 Z" fill="#34d399" />
          </marker>
          <marker id="summaryArrowAmber" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 1 1 L 7 4 L 1 7 Z" fill="#fbbf24" />
          </marker>
          <marker id="summaryFeedbackArrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 1 1 L 7 4 L 1 7 Z" fill="#fbbf24" />
          </marker>
        </defs>

        <rect width="900" height="380" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

        <text x="450" y="28" textAnchor="middle" fill="#f8fafc" fontSize="18" fontWeight="700">
          The Deliberation Lifecycle: The Whole Article in One Diagram
        </text>
        <text x="450" y="48" textAnchor="middle" fill="#94a3b8" fontSize="12">
          A five-step operational policy for allocating search budget, tools, and verification
        </text>

        {/* Feedback Loop */}
        <path
          d="M 626 68 C 626 55, 274 55, 274 68"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          markerEnd="url(#summaryFeedbackArrow)"
        />
        <rect x="375" y="47" width="150" height="17" rx="3" fill="#0f172a" stroke="#fbbf24" strokeOpacity="0.4" />
        <text x="450" y="59" textAnchor="middle" fill="#fbbf24" fontSize="9.5" fontWeight="700">
          Retry with Empirical Error Trace
        </text>

        {/* 5 Sequential Cards */}
        {/* Card 1 */}
        <g transform="translate(25, 68)">
          <rect width="146" height="204" rx="10" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
          <rect x="8" y="8" width="54" height="18" rx="3" fill="#082f49" />
          <text x="35" y="21" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="700">
            STEP 01
          </text>
          <text x="73" y="44" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="700">
            MISSING FACT?
          </text>
          <line x1="15" y1="54" x2="131" y2="54" stroke="#1e293b" />
          <text x="73" y="74" textAnchor="middle" fill="#38bdf8" fontSize="14" fontWeight="800">
            RETRIEVE
          </text>
          <rect x="10" y="84" width="126" height="22" rx="4" fill="#0c1e33" stroke="#38bdf8" strokeOpacity="0.4" />
          <text x="73" y="99" textAnchor="middle" fill="#7dd3fc" fontSize="10.5" fontWeight="600">
            Tool Use &amp; Grep
          </text>
          <text x="73" y="126" textAnchor="middle" fill="#cbd5e1" fontSize="11">
            Never deliberate
          </text>
          <text x="73" y="142" textAnchor="middle" fill="#cbd5e1" fontSize="11">
            on what can be
          </text>
          <text x="73" y="158" textAnchor="middle" fill="#cbd5e1" fontSize="11">
            read from disk.
          </text>
          <rect x="15" y="174" width="116" height="18" rx="3" fill="#0f172a" />
          <text x="73" y="187" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="600">
            Ground truth first
          </text>
        </g>

        <line x1="173" y1="168" x2="199" y2="168" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#summaryArrowCyan)" />

        {/* Card 2 */}
        <g transform="translate(201, 68)">
          <rect width="146" height="204" rx="10" fill="#090d16" stroke="#ec4899" strokeWidth="1.5" />
          <rect x="8" y="8" width="54" height="18" rx="3" fill="#4a0429" />
          <text x="35" y="21" textAnchor="middle" fill="#ec4899" fontSize="10" fontWeight="700">
            STEP 02
          </text>
          <text x="73" y="44" textAnchor="middle" fill="#f8fafc" fontSize="11.5" fontWeight="700">
            HARD INFERENCE?
          </text>
          <line x1="15" y1="54" x2="131" y2="54" stroke="#1e293b" />
          <text x="73" y="74" textAnchor="middle" fill="#ec4899" fontSize="14" fontWeight="800">
            REASON
          </text>
          <rect x="10" y="84" width="126" height="22" rx="4" fill="#2d081b" stroke="#ec4899" strokeOpacity="0.4" />
          <text x="73" y="99" textAnchor="middle" fill="#f472b6" fontSize="10.5" fontWeight="600">
            Reasoning Tokens
          </text>
          <text x="73" y="126" textAnchor="middle" fill="#cbd5e1" fontSize="11">
            Spend search budget
          </text>
          <text x="73" y="142" textAnchor="middle" fill="#cbd5e1" fontSize="11">
            on logic branches
          </text>
          <text x="73" y="158" textAnchor="middle" fill="#cbd5e1" fontSize="11">
            &amp; edge invariants.
          </text>
          <rect x="15" y="174" width="116" height="18" rx="3" fill="#0f172a" />
          <text x="73" y="187" textAnchor="middle" fill="#ec4899" fontSize="10" fontWeight="600">
            Targeted compute
          </text>
        </g>

        <line x1="349" y1="168" x2="375" y2="168" stroke="#ec4899" strokeWidth="2" markerEnd="url(#summaryArrowPink)" />

        {/* Card 3 */}
        <g transform="translate(377, 68)">
          <rect width="146" height="204" rx="10" fill="#090d16" stroke="#34d399" strokeWidth="1.5" />
          <rect x="8" y="8" width="54" height="18" rx="3" fill="#064e3b" />
          <text x="35" y="21" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="700">
            STEP 03
          </text>
          <text x="73" y="44" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="700">
            NOT SURE?
          </text>
          <line x1="15" y1="54" x2="131" y2="54" stroke="#1e293b" />
          <text x="73" y="74" textAnchor="middle" fill="#34d399" fontSize="14" fontWeight="800">
            VERIFY
          </text>
          <rect x="10" y="84" width="126" height="22" rx="4" fill="#062e22" stroke="#34d399" strokeOpacity="0.4" />
          <text x="73" y="99" textAnchor="middle" fill="#6ee7b7" fontSize="10.5" fontWeight="600">
            Compilers &amp; Tests
          </text>
          <text x="73" y="126" textAnchor="middle" fill="#cbd5e1" fontSize="11">
            Let deterministic
          </text>
          <text x="73" y="142" textAnchor="middle" fill="#cbd5e1" fontSize="11">
            tooling confirm or
          </text>
          <text x="73" y="158" textAnchor="middle" fill="#cbd5e1" fontSize="11">
            refute hypothesis.
          </text>
          <rect x="15" y="174" width="116" height="18" rx="3" fill="#0f172a" />
          <text x="73" y="187" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="600">
            Deterministic check
          </text>
        </g>

        <line x1="525" y1="168" x2="551" y2="168" stroke="#34d399" strokeWidth="2" markerEnd="url(#summaryArrowEmerald)" />

        {/* Card 4 */}
        <g transform="translate(553, 68)">
          <rect width="146" height="204" rx="10" fill="#090d16" stroke="#fbbf24" strokeWidth="1.5" />
          <rect x="8" y="8" width="54" height="18" rx="3" fill="#451a03" />
          <text x="35" y="21" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="700">
            STEP 04
          </text>
          <text x="73" y="44" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="700">
            STILL STUCK?
          </text>
          <line x1="15" y1="54" x2="131" y2="54" stroke="#1e293b" />
          <text x="73" y="74" textAnchor="middle" fill="#fbbf24" fontSize="13.5" fontWeight="800">
            ESCALATE
          </text>
          <rect x="10" y="84" width="126" height="22" rx="4" fill="#291c06" stroke="#fbbf24" strokeOpacity="0.4" />
          <text x="73" y="99" textAnchor="middle" fill="#fde68a" fontSize="10.5" fontWeight="600">
            Escalate Ladder
          </text>
          <text x="73" y="126" textAnchor="middle" fill="#cbd5e1" fontSize="11">
            Only bump effort
          </text>
          <text x="73" y="142" textAnchor="middle" fill="#cbd5e1" fontSize="11">
            when armed with
          </text>
          <text x="73" y="158" textAnchor="middle" fill="#cbd5e1" fontSize="11">
            error diagnostics.
          </text>
          <rect x="15" y="174" width="116" height="18" rx="3" fill="#0f172a" />
          <text x="73" y="187" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="600">
            Armed escalation
          </text>
        </g>

        <line x1="701" y1="168" x2="727" y2="168" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#summaryArrowAmber)" />

        {/* Card 5 */}
        <g transform="translate(729, 68)">
          <rect width="146" height="204" rx="10" fill="#090d16" stroke="#10b981" strokeWidth="1.5" />
          <rect x="8" y="8" width="54" height="18" rx="3" fill="#064e3b" />
          <text x="35" y="21" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="700">
            STEP 05
          </text>
          <text x="73" y="44" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="700">
            RESOLVED?
          </text>
          <line x1="15" y1="54" x2="131" y2="54" stroke="#1e293b" />
          <text x="73" y="74" textAnchor="middle" fill="#10b981" fontSize="13.5" fontWeight="800">
            STOP &amp; SHIP
          </text>
          <rect x="10" y="84" width="126" height="22" rx="4" fill="#063324" stroke="#10b981" strokeOpacity="0.4" />
          <text x="73" y="99" textAnchor="middle" fill="#a7f3d0" fontSize="10.5" fontWeight="600">
            Ship Immediately
          </text>
          <text x="73" y="126" textAnchor="middle" fill="#cbd5e1" fontSize="11">
            Deliberation ends
          </text>
          <text x="73" y="142" textAnchor="middle" fill="#cbd5e1" fontSize="11">
            instantly. Zero
          </text>
          <text x="73" y="158" textAnchor="middle" fill="#cbd5e1" fontSize="11">
            token rumination.
          </text>
          <rect x="15" y="174" width="116" height="18" rx="3" fill="#0f172a" />
          <text x="73" y="187" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="600">
            Deliberation done
          </text>
        </g>

        {/* Tagline Banner */}
        <rect
          x="25"
          y="284"
          width="850"
          height="64"
          rx="12"
          fill="#0b1329"
          stroke="#38bdf8"
          strokeWidth="1.2"
          strokeOpacity="0.5"
        />
        <rect x="330" y="274" width="240" height="20" rx="10" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
        <text
          x="450"
          y="288"
          textAnchor="middle"
          fill="#f8fafc"
          fontSize="10.5"
          fontWeight="700"
          letterSpacing="0.6"
        >
          MINIMUM SUFFICIENT DELIBERATION
        </text>

        <text x="450" y="313" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="700">
          The best agent isn&apos;t the one that thinks the most.
        </text>
        <text x="450" y="333" textAnchor="middle" fill="#38bdf8" fontSize="12.5" fontWeight="600">
          It is the one that knows when another unit of thinking is still worth buying.
        </text>

        <text x="450" y="366" textAnchor="middle" fill="#64748b" fontSize="11">
          Illustrative · Test-time compute allocation policy · Gaia Research
        </text>
      </svg>
      </div>
      <div className="blog-svg-mobile">
        <MobileFigureSummaryLoop />
      </div>
    </figure>
  );
}

function loadPost() {
  // Strip H1 title & byline — the header below renders them.
  return postMd.split("\n").slice(4).join("\n").trim();
}

export default function BlogPostPage() {
  const body = loadPost();
  return (
    <>
      <SiteHeader />
      <main id="main" className="blog-post-page">
        <PostShareBar />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleStructuredData).replace(/</g, "\\u003c"),
          }}
        />
        <header className="blog-post-head">
          <p className="blog-post-meta">
            <time dateTime="2026-09-04">September 04, 2026</time> ·{" "}
            <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">
              {novaAuthor.display_name}
            </a>{" "}
            · Head Researcher, Gaia Research
          </p>
          <h1>{articleTitle}</h1>
          <p className="blog-post-summary">
            Why reasoning effort is a test-time search budget across frozen weights rather than an intelligence dial.
          </p>
        </header>

        <figure className="blog-post-illustration">
          <img
            src={dontMakeTheModelThinkHarderThumbnail.src.src}
            width={dontMakeTheModelThinkHarderThumbnail.src.width}
            height={dontMakeTheModelThinkHarderThumbnail.src.height}
            alt={dontMakeTheModelThinkHarderThumbnail.alt}
          />
        </figure>

        <article className="blog-post-body report-body">
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              p: ({ children, ...props }) => {
                const childArray = Array.isArray(children) ? children : [children];
                const text =
                  childArray.length === 1 && typeof childArray[0] === "string" ? childArray[0] : null;

                if (text === "[[FIGURE_EFFORT_SPECTRUM]]") {
                  return <FigureEffortSpectrum />;
                }
                if (text === "[[FIGURE_WHATS_MISSING]]") {
                  return <FigureWhatsMissing />;
                }
                if (text === "[[FIGURE_TWO_ENGINES]]") {
                  return <FigureTwoEngines />;
                }
                if (text === "[[FIGURE_TOOLS_VS_THINKING]]") {
                  return <FigureToolsVsThinking />;
                }
                if (text === "[[FIGURE_SWEET_SPOT_CURVE]]") {
                  return <FigureSweetSpotCurve />;
                }
                if (text === "[[FIGURE_ESCALATION_LADDER]]") {
                  return <FigureEscalationLadder />;
                }
                if (text === "[[FIGURE_THREE_AGENTS]]") {
                  return <FigureThreeAgents />;
                }
                if (text === "[[FIGURE_SUMMARY_LOOP]]") {
                  return <FigureSummaryLoop />;
                }

                return <p {...props}>{children}</p>;
              },
            }}
          >
            {body}
          </Markdown>
        </article>

        <footer className="blog-post-foot">
          <Link href="/blog">
            Back to Blog <span aria-hidden="true">→</span>
          </Link>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
