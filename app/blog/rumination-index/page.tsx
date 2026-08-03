import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import novaAuthor from "@/content/authors/nova.json";
import { ruminationIndexEditorialThumbnail } from "@/data/blog";
import postMd from "@/content/blog/rumination-index/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/rumination-index";
const articleUrl = `${siteUrl}${articlePath}`;
const articleTitle = "Opus 5 vs. Fable 5: Rumination, Overthinking, and the Hidden Cost of Being Half the Price";
const thumbnailUrl = `${siteUrl}${ruminationIndexEditorialThumbnail.src.src}`;
const articleDescription =
  "Opus 5 is half the price of Fable 5. The difference is not capability — it is rumination. Opus 5 overthinks; Fable 5 commits and course-corrects.";

export const metadata = {
  title: articleTitle,
  description: articleDescription,
  keywords: [
    "rumination",
    "model behavior",
    "psychology",
    "Opus 5",
    "Fable 5",
    "agentic EQ",
    "overthinking",
    "BIS",
    "BAS",
    "context engineering",
    "prompting",
  ],
  alternates: { canonical: articlePath },
  openGraph: {
    type: "article",
    url: articlePath,
    title: articleTitle,
    description: articleDescription,
    publishedTime: "2026-08-01T00:00:00+08:00",
    authors: [novaAuthor.display_name],
    images: [{
      url: ruminationIndexEditorialThumbnail.src.src,
      width: 1600,
      height: 900,
      alt: ruminationIndexEditorialThumbnail.alt,
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
    images: [ruminationIndexEditorialThumbnail.src.src],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: articleTitle,
  description: articleDescription,
  image: thumbnailUrl,
  url: articleUrl,
  datePublished: "2026-08-01T00:00:00+08:00",
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

function loadPost() {
  // Strip H1 title & subtitle since header renders them
  return postMd.split("\n").slice(4).join("\n").trim();
}function RuminationSignalsFigure() {
  const signals = [
    { id: "s1", title: "Repeated tool calls", desc: "Same or paraphrased call within short window", color: "#ec4899", icon: "loop" },
    { id: "s2", title: "Context re-ingestion", desc: "Tokens spent re-reading already-processed blocks", color: "#f43f5e", icon: "reingest" },
    { id: "s3", title: "Self-confirmation spiral", desc: "\"Let me verify\" → \"Let me double-check\"", color: "#38bdf8", icon: "spiral" },
    { id: "s4", title: "Decision latency", desc: "Gap between sufficient info and first action", color: "#0ea5e9", icon: "delay" },
  ];

  const SignalIcon = ({ type, c }: { type: string; c: string }) => {
    switch (type) {
      case "loop":
        return (
          <g transform="translate(-12, -12)">
            <circle cx="12" cy="12" r="13" fill="#0f172a" stroke={c} strokeWidth="1.5" />
            <path d="M 7 12 A 5 5 0 1 1 12 17" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
            <polygon points="10,17 14,19 13,15" fill={c} />
          </g>
        );
      case "reingest":
        return (
          <g transform="translate(-12, -12)">
            <circle cx="12" cy="12" r="13" fill="#0f172a" stroke={c} strokeWidth="1.5" />
            <rect x="6" y="6" width="12" height="6" rx="1.5" fill="none" stroke={c} strokeWidth="1.4" />
            <path d="M 12 12 L 12 17 L 16 17" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <polygon points="14,15 18,17 14,19" fill={c} />
          </g>
        );
      case "spiral":
        return (
          <g transform="translate(-12, -12)">
            <circle cx="12" cy="12" r="13" fill="#0f172a" stroke={c} strokeWidth="1.5" />
            <path d="M 6 16 C 5 8, 14 6, 17 11 C 19 15, 14 19, 10 16" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
            <polygon points="12,14 8,16 11,18" fill={c} />
          </g>
        );
      case "delay":
        return (
          <g transform="translate(-12, -12)">
            <circle cx="12" cy="12" r="13" fill="#0f172a" stroke={c} strokeWidth="1.5" />
            <circle cx="12" cy="12" r="7" fill="none" stroke={c} strokeWidth="1.4" />
            <polyline points="12 8 12 12 15 12" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <figure className="blog-figure blog-figure-chart">
      <figcaption>Four observable signals of agentic rumination in harness logs</figcaption>
      <svg viewBox="0 0 760 300" role="img" aria-labelledby="rumination-signals-title rumination-signals-desc">
        <title id="rumination-signals-title">Rumination signals</title>
        <desc id="rumination-signals-desc">
          Four behavioral signatures of rumination visible in harness logs without model cooperation:
          repeated tool calls, context re-ingestion, self-confirmation spirals, and decision latency.
        </desc>
        <defs>
          <marker id="arr-ec4899" viewBox="0 0 8 6" refX="8" refY="3" markerWidth="7" markerHeight="5" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#ec4899" />
          </marker>
          <marker id="arr-f43f5e" viewBox="0 0 8 6" refX="8" refY="3" markerWidth="7" markerHeight="5" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#f43f5e" />
          </marker>
          <marker id="arr-38bdf8" viewBox="0 0 8 6" refX="8" refY="3" markerWidth="7" markerHeight="5" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#38bdf8" />
          </marker>
          <marker id="arr-0ea5e9" viewBox="0 0 8 6" refX="8" refY="3" markerWidth="7" markerHeight="5" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#0ea5e9" />
          </marker>
        </defs>
        {signals.map((s, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const x = 20 + col * 380;
          const y = 20 + row * 140;
          const markerId = `arr-${s.color.replace('#', '')}`;
          return (
            <g key={s.id}>
              {/* Card background */}
              <rect x={x} y={y} width="360" height="120" rx="10" fill="#131c2e" />
              {/* Colored left accent stripe */}
              <rect x={x} y={y} width="4" height="120" rx="2" fill={s.color} />
              {/* Title */}
              <text x={x + 18} y={y + 26} fill="#f8fafc" fontSize="13" fontWeight="600">{s.title}</text>
              {/* Icon in top-right of card */}
              <g transform={`translate(${x + 332}, ${y + 24})`}>
                <SignalIcon type={s.icon} c={s.color} />
              </g>
              {/* Description */}
              <text x={x + 18} y={y + 45} fill="#94a3b8" fontSize="11.5">{s.desc}</text>
              {/* Divider */}
              <line x1={x + 18} y1={y + 57} x2={x + 342} y2={y + 57} stroke="#1e293b" strokeWidth="1" />
              {/* Mini diagram inside card */}
              {s.icon === "loop" ? (
                <g transform={`translate(${x + 18}, ${y + 70})`}>
                  <rect x="0" y="2" width="38" height="22" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                  <text x="19" y="16" fill="#cbd5e1" fontSize="8.5" textAnchor="middle">Tool A</text>
                  <line x1="38" y1="13" x2="58" y2="13" stroke="#475569" strokeWidth="1.2" markerEnd={`url(#${markerId})`} />
                  <rect x="58" y="2" width="38" height="22" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                  <text x="77" y="16" fill="#cbd5e1" fontSize="8.5" textAnchor="middle">Tool B</text>
                  <line x1="96" y1="13" x2="116" y2="13" stroke="#475569" strokeWidth="1.2" markerEnd={`url(#${markerId})`} />
                  <rect x="116" y="2" width="44" height="22" rx="4" fill="#0f172a" stroke={s.color} strokeWidth="1.4" />
                  <text x="138" y="16" fill={s.color} fontSize="8.5" fontWeight="600" textAnchor="middle">Tool A'</text>
                  <path d="M 160 13 C 176 0, 176 26, 160 26 L 24 26 L 24 24" stroke={s.color} strokeWidth="1.2" fill="none" markerEnd={`url(#${markerId})`} strokeDasharray="3,2" />
                  <text x="190" y="16" fill={s.color} fontSize="8.5" fontWeight="600">repeat</text>
                </g>
              ) : s.icon === "reingest" ? (
                <g transform={`translate(${x + 18}, ${y + 70})`}>
                  <rect x="0" y="2" width="76" height="22" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                  <text x="38" y="16" fill="#94a3b8" fontSize="8.5" textAnchor="middle">Context (128k)</text>
                  <line x1="76" y1="13" x2="104" y2="13" stroke="#475569" strokeWidth="1.2" markerEnd={`url(#${markerId})`} />
                  <rect x="104" y="2" width="76" height="22" rx="4" fill="#0f172a" stroke={s.color} strokeWidth="1.4" />
                  <text x="142" y="16" fill="#f8fafc" fontSize="8.5" textAnchor="middle">Re-read context</text>
                  <rect x="188" y="4" width="54" height="18" rx="3" fill="rgba(244, 63, 94, 0.12)" stroke={s.color} strokeWidth="1" />
                  <text x="215" y="16" fill={s.color} fontSize="8" fontWeight="700" textAnchor="middle">+4.2k tokens</text>
                </g>
              ) : s.icon === "spiral" ? (
                <g transform={`translate(${x + 18}, ${y + 70})`}>
                  <rect x="0" y="2" width="56" height="22" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                  <text x="28" y="16" fill="#94a3b8" fontSize="8.5" textAnchor="middle">Result ✓</text>
                  <line x1="56" y1="13" x2="84" y2="13" stroke="#475569" strokeWidth="1.2" strokeDasharray="3,2" />
                  <rect x="84" y="2" width="90" height="22" rx="4" fill="#0f172a" stroke={s.color} strokeWidth="1.4" />
                  <text x="129" y="16" fill={s.color} fontSize="8.5" fontWeight="600" textAnchor="middle">"Let me check..."</text>
                  <path d="M 174 13 C 190 2, 190 24, 174 24 L 132 24" stroke={s.color} strokeWidth="1.2" fill="none" markerEnd={`url(#${markerId})`} />
                  <text x="194" y="16" fill={s.color} fontSize="8.5" fontWeight="600">loop</text>
                </g>
              ) : (
                <g transform={`translate(${x + 18}, ${y + 70})`}>
                  <rect x="0" y="2" width="62" height="22" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                  <text x="31" y="16" fill="#94a3b8" fontSize="8.5" textAnchor="middle">Info Ready</text>
                  <line x1="62" y1="13" x2="80" y2="13" stroke={s.color} strokeWidth="1.2" strokeDasharray="3,2" />
                  <rect x="80" y="4" width="52" height="18" rx="3" fill="#0f172a" stroke={s.color} strokeWidth="1" />
                  <text x="106" y="16" fill={s.color} fontSize="8" fontWeight="700" textAnchor="middle">4.2s delay</text>
                  <line x1="132" y1="13" x2="150" y2="13" stroke={s.color} strokeWidth="1.2" strokeDasharray="3,2" />
                  <rect x="150" y="2" width="68" height="22" rx="4" fill="#0f172a" stroke={s.color} strokeWidth="1.4" />
                  <text x="184" y="16" fill="#cbd5e1" fontSize="8.5" fontWeight="600" textAnchor="middle">First Action</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <p className="blog-svg-note">Conceptual framework — no measured data. Signals are proposed for future validation.</p>
    </figure>
  );
}

function BisBasFigure() {
  const barY = 110;
  const opusX = 148;   // high-BIS marker: ~13.75% of 640 bar (x = 60 + 88 = 148)
  const fableX = 430;  // near-neutral / mild-BAS: ~57.8% of 640 bar (x = 60 + 370 = 430)

  return (
    <figure className="blog-figure blog-figure-chart">
      <figcaption>BIS/BAS calibration: the proposed EQ axis for agentic behavior</figcaption>
      <svg viewBox="0 0 760 260" role="img" aria-labelledby="bis-bas-title bis-bas-desc">
        <title id="bis-bas-title">BIS and BAS calibration spectrum</title>
        <desc id="bis-bas-desc">
          A single spectrum from Behavioral Inhibition System (verify, error-avoidance, rumination risk)
          through neutral to Behavioral Activation System (act, explore, course-correct, rumination risk low).
          Opus 5 calibrates toward the high-BIS end; Fable 5 lands near neutral with a mild BAS lean —
          decisive when context is sufficient, but its safety self-critique tempers pure activation.
        </desc>
        <defs>
          <linearGradient id="bisbas-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="bar-glow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Title block */}
        <text x="380" y="36" fill="#f8fafc" fontSize="15" fontWeight="700" textAnchor="middle">
          Behavioral Calibration Spectrum
        </text>
        <text x="380" y="54" fill="#64748b" fontSize="11.5" textAnchor="middle">
          Inhibition ←—— → Activation
        </text>

        {/* Glow beneath bar */}
        <rect x="60" y={barY + 2} width="640" height="18" rx="9" fill="url(#bar-glow)" />

        {/* Spectrum bar */}
        <rect x="60" y={barY} width="640" height="16" rx="8" fill="#1e293b" />
        <rect x="60" y={barY} width="640" height="16" rx="8" fill="url(#bisbas-grad)" />

        {/* Neutral midpoint tick */}
        <line x1="380" y1={barY - 4} x2="380" y2={barY + 20} stroke="#475569" strokeWidth="1" strokeDasharray="2,2" />

        {/* End & Midpoint Labels */}
        <text x="60" y={barY - 12} fill="#38bdf8" fontSize="12" fontWeight="600" textAnchor="start">
          BIS · Verify
        </text>
        <text x="700" y={barY - 12} fill="#ec4899" fontSize="12" fontWeight="600" textAnchor="end">
          BAS · Act
        </text>
        <text x="60" y={barY + 34} fill="#475569" fontSize="10" textAnchor="start">
          Re-verify
        </text>
        <text x="380" y={barY + 34} fill="#475569" fontSize="10" textAnchor="middle">
          Neutral
        </text>
        <text x="700" y={barY + 34} fill="#475569" fontSize="10" textAnchor="end">
          Course-correct
        </text>

        {/* Opus 5 marker (high-BIS) */}
        <line x1={opusX} y1={barY - 32} x2={opusX} y2={barY + 24} stroke="#38bdf8" strokeWidth="1.5" />
        <rect x={opusX - 32} y={barY - 48} width="64" height="22" rx="11" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.8" />
        <text x={opusX} y={barY - 33} fill="#38bdf8" fontSize="10.5" fontWeight="700" textAnchor="middle">
          Opus 5
        </text>
        <circle cx={opusX} cy={barY + 8} r="5" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />

        {/* Fable 5 marker (near-neutral / mild BAS) */}
        <line x1={fableX} y1={barY - 32} x2={fableX} y2={barY + 24} stroke="#ec4899" strokeWidth="1.5" />
        <rect x={fableX - 38} y={barY - 48} width="76" height="22" rx="11" fill="#0f172a" stroke="#ec4899" strokeWidth="1.8" />
        <text x={fableX} y={barY - 33} fill="#ec4899" fontSize="10.5" fontWeight="700" textAnchor="middle">
          Fable 5
        </text>
        <circle cx={fableX} cy={barY + 8} r="5" fill="#ec4899" stroke="#0f172a" strokeWidth="2" />

        {/* Behavioral outcome profile cards */}
        <g transform="translate(0, 180)">
          <rect x="60" y="0" width="310" height="54" rx="8" fill="#131c2e" />
          <rect x="60" y="0" width="4" height="54" rx="2" fill="#38bdf8" />
          <text x="80" y="22" fill="#f8fafc" fontSize="12" fontWeight="600">Opus 5 Profile</text>
          <text x="80" y="40" fill="#94a3b8" fontSize="11">High BIS: re-verifies · loops · stalls</text>

          <rect x="390" y="0" width="310" height="54" rx="8" fill="#131c2e" />
          <rect x="390" y="0" width="4" height="54" rx="2" fill="#ec4899" />
          <text x="410" y="22" fill="#f8fafc" fontSize="12" fontWeight="600">Fable 5 Profile</text>
          <text x="410" y="40" fill="#94a3b8" fontSize="11">Near-neutral, mild BAS: commits · self-critiques · moves</text>
        </g>
      </svg>
      <p className="blog-svg-note">Illustrative framework from reinforcement sensitivity theory; applied to model behavior, not measured.</p>
    </figure>
  );
}
function EconomicsGapFigure() {
  return (
    <figure className="blog-figure blog-figure-chart">
      <figcaption>The Overthinking Tax: Headline token discount vs. real-world task run savings</figcaption>
      <svg viewBox="0 0 760 220" role="img" aria-labelledby="econ-gap-title econ-gap-desc">
        <title id="econ-gap-title">Headline price cut vs actual task savings</title>
        <desc id="econ-gap-desc">
          While Opus 5 has a 50 percent headline token price discount over Fable 5, real-world task run savings erode to roughly 20 percent due to rumination and fix-bloat.
        </desc>

        {/* Headline Price Cut Bar */}
        <g transform="translate(60, 35)">
          <text x="0" y="16" fill="#94a3b8" fontSize="12" fontWeight="600">Headline Token Price</text>
          <rect x="0" y="26" width="300" height="32" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          <rect x="0" y="26" width="150" height="32" rx="6" fill="#38bdf8" />
          <text x="75" y="46" fill="#0f172a" fontSize="11" fontWeight="800" textAnchor="middle">-50% per token</text>
          <text x="160" y="46" fill="#64748b" fontSize="11">$5 / $25 per M tokens</text>
        </g>

        {/* Real Task-Run Savings Bar */}
        <g transform="translate(60, 115)">
          <text x="0" y="16" fill="#94a3b8" fontSize="12" fontWeight="600">Real Task-Run Cost (In Harness)</text>
          <rect x="0" y="26" width="300" height="32" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          <rect x="0" y="26" width="235" height="32" rx="6" fill="#ec4899" />
          <text x="117" y="46" fill="#ffffff" fontSize="11" fontWeight="800" textAnchor="middle">~20% Actual Savings</text>
          <text x="245" y="46" fill="#64748b" fontSize="11">Wall-clock & tokens</text>
        </g>

        {/* Overthinking Tax Gap Card */}
        <g transform="translate(420, 35)">
          <rect x="0" y="0" width="280" height="144" rx="10" fill="#131c2e" stroke="#f43f5e" strokeWidth="1.2" />
          <rect x="0" y="0" width="4" height="144" rx="2" fill="#f43f5e" />
          <text x="20" y="30" fill="#f43f5e" fontSize="12" fontWeight="700" letterSpacing="0.04em">THE OVERTHINKING TAX (+30%)</text>
          <line x1="20" y1="42" x2="260" y2="42" stroke="#1e293b" strokeWidth="1" />
          
          <text x="20" y="64" fill="#cbd5e1" fontSize="11">• 2.1x token re-ingestion</text>
          <text x="20" y="86" fill="#cbd5e1" fontSize="11">• Redundant self-verification loops</text>
          <text x="20" y="108" fill="#cbd5e1" fontSize="11">• Code nitpicking & fix-bloat</text>
          <text x="20" y="128" fill="#94a3b8" fontSize="10" fontStyle="italic">Erodes half-price token advantages</text>
        </g>
      </svg>
      <p className="blog-svg-note">Observed harness behavior across agent execution trials; task-level economics vs. raw token pricing.</p>
    </figure>
  );
}

function ReasoningEffortFigure() {
  return (
    <figure className="blog-figure blog-figure-chart">
      <figcaption>The Reasoning Effort Paradox: Task success peaks at Medium effort; Max effort spikes rumination</figcaption>
      <svg viewBox="0 0 760 230" role="img" aria-labelledby="effort-title effort-desc">
        <title id="effort-title">Reasoning effort dial vs task success</title>
        <desc id="effort-desc">
          Task completion efficiency peaks at medium reasoning effort. Cranking reasoning to Max causes overthinking, fix-bloat, and increased latency without accuracy gains.
        </desc>

        {/* Axes */}
        <line x1="80" y1="170" x2="680" y2="170" stroke="#334155" strokeWidth="1.5" />
        <line x1="80" y1="30" x2="80" y2="170" stroke="#334155" strokeWidth="1.5" />

        {/* Axis Labels */}
        <text x="380" y="206" fill="#94a3b8" fontSize="11" fontWeight="600" textAnchor="middle">Reasoning Effort Setting (Thinking Depth)</text>
        <text x="40" y="100" fill="#94a3b8" fontSize="11" fontWeight="600" textAnchor="middle" transform="rotate(-90, 40, 100)">Task Efficiency / Success</text>

        {/* Effort Level Ticks */}
        <text x="160" y="188" fill="#64748b" fontSize="11" textAnchor="middle">Low Effort</text>
        <text x="380" y="188" fill="#38bdf8" fontSize="11" fontWeight="700" textAnchor="middle">Medium Effort (Optimal)</text>
        <text x="600" y="188" fill="#ec4899" fontSize="11" fontWeight="700" textAnchor="middle">Max Effort (Rumination Risk)</text>

        {/* Curve Area Fill */}
        <path d="M 120 150 Q 380 40 600 130 L 600 170 L 120 170 Z" fill="rgba(56, 189, 248, 0.06)" />

        {/* Curve Path */}
        <path d="M 120 150 Q 380 40 600 130" fill="none" stroke="#38bdf8" strokeWidth="3" />

        {/* Peak Dot (Medium) */}
        <circle cx="380" cy="58" r="6" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
        <rect x="310" y="24" width="140" height="24" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
        <text x="380" y="40" fill="#38bdf8" fontSize="10" fontWeight="700" textAnchor="middle">Peak Task Efficiency</text>

        {/* Drop Callout (Max) */}
        <circle cx="600" cy="130" r="6" fill="#ec4899" stroke="#0f172a" strokeWidth="2" />
        <rect x="510" y="70" width="170" height="44" rx="6" fill="#131c2e" stroke="#ec4899" strokeWidth="1.2" />
        <text x="595" y="88" fill="#ec4899" fontSize="10.5" fontWeight="700" textAnchor="middle">Overthinking Tax</text>
        <text x="595" y="104" fill="#94a3b8" fontSize="9.5" textAnchor="middle">Fix-bloat & self-loops</text>
        <line x1="595" y1="114" x2="600" y2="124" stroke="#ec4899" strokeWidth="1" strokeDasharray="2,2" />
      </svg>
      <p className="blog-svg-note">Effort-to-performance dynamic observed across developer benchmarks and extended reasoning evaluations.</p>
    </figure>
  );
}

export default function BlogPostPage() {
  const body = loadPost();
  return (
    <>
      <SiteHeader />
      <main id="main" className="blog-post-page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData).replace(/</g, "\\u003c") }}
        />
        <header className="blog-post-head">
          <p className="blog-post-meta">
            <time dateTime="2026-08-01">August 1, 2026</time> · {" "}
            <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">
              {novaAuthor.display_name}
            </a>
          </p>
          <h1>{articleTitle}</h1>
          <p className="blog-post-summary">
            Opus 5 costs roughly half of Fable 5 per token, but the difference is behavior, not capability. Opus 5 tends to re-verify context while Fable 5 moves faster. A proposed Rumination Index links this pattern to existing psych constructs.
          </p>
        </header>

        <figure className="blog-post-illustration">
          <img
            src={ruminationIndexEditorialThumbnail.src.src}
            width={ruminationIndexEditorialThumbnail.src.width}
            height={ruminationIndexEditorialThumbnail.src.height}
            alt={ruminationIndexEditorialThumbnail.alt}
          />
        </figure>

        <article className="blog-post-body report-body">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              img: ({ src, alt, ...props }) => (
                <img src={src} alt={alt || ""} className="blog-post-body-img" {...props} />
              ),
              p: ({ children, ...props }) => {
                const text = props.node?.children
                  .map((child) => child.type === "text" ? child.value : "")
                  .join("")
                  ?? (Array.isArray(children) ? children.join("") : typeof children === "string" ? children : "");
                if (text === "[[RUMINATION_SIGNALS]]") {
                  return <RuminationSignalsFigure />;
                }
                if (text === "[[BIS_BAS]]") {
                  return <BisBasFigure />;
                }
                if (text === "[[ECONOMICS_GAP]]") {
                  return <EconomicsGapFigure />;
                }
                if (text === "[[REASONING_EFFORT]]") {
                  return <ReasoningEffortFigure />;
                }
                return <p {...props}>{children}</p>;
              },
            }}
          >
            {body}
          </Markdown>
        </article>

        <footer className="blog-post-foot">
          <Link href="/blog">Back to Blog <span aria-hidden="true">→</span></Link>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
