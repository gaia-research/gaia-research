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
}

function RuminationSignalsFigure() {
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
          <g stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="30" cy="40" r="11" />
            <polyline points="38,32 46,40 38,48" />
            <line x1="46" y1="40" x2="54" y2="40" />
            <path d="M54,30 A14,14 0 0,1 54,50" markerEnd={`url(#arr-${c.replace('#','')})`} />
          </g>
        );
      case "reingest":
        return (
          <g stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="20" y1="28" x2="20" y2="50" markerEnd={`url(#arr-dn-${c.replace('#','')})`} />
            <line x1="20" y1="50" x2="40" y2="50" markerEnd={`url(#arr-h-${c.replace('#','')})`} />
            <line x1="40" y1="50" x2="40" y2="28" markerEnd={`url(#arr-up-${c.replace('#','')})`} />
            <line x1="40" y1="28" x2="54" y2="28" markerEnd={`url(#arr-h-${c.replace('#','')})`} />
            <text x="30" y="58" fill="#475569" fontSize="7" textAnchor="middle">re-read</text>
          </g>
        );
      case "spiral":
        return (
          <g stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round">
            <path d="M 24 46 Q 16 32 30 28 Q 44 24 42 38 Q 40 50 28 48" markerEnd={`url(#arr-${c.replace('#','')})`} />
          </g>
        );
      case "delay":
        return (
          <g stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round">
            <line x1="16" y1="40" x2="48" y2="40" strokeDasharray="4,3" />
            <text x="56" y="44" fill="#475569" fontSize="8">delay</text>
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
          {/* Arrowhead markers — one per unique color used in diagrams */}
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
          <marker id="arr-dn-f43f5e" viewBox="0 0 8 6" refX="8" refY="3" markerWidth="7" markerHeight="5" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#f43f5e" />
          </marker>
          <marker id="arr-up-f43f5e" viewBox="0 0 8 6" refX="8" refY="3" markerWidth="7" markerHeight="5" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#f43f5e" />
          </marker>
          <marker id="arr-h-f43f5e" viewBox="0 0 8 6" refX="8" refY="3" markerWidth="7" markerHeight="5" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#f43f5e" />
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
              <text x={x + 18} y={y + 24} fill="#f8fafc" fontSize="13" fontWeight="600">{s.title}</text>
              {/* Icon */}
              <SignalIcon type={s.icon} c={s.color} />
              {/* Description */}
              <text x={x + 18} y={y + 54} fill="#94a3b8" fontSize="12">{s.desc}</text>
              {/* Divider */}
              <line x1={x + 18} y1={y + 66} x2={x + 340} y2={y + 66} stroke="#1e293b" strokeWidth="1" />
              {/* Mini diagram */}
              {s.icon === "loop" ? (
                <g transform={`translate(${x + 18}, ${y + 82})`}>
                  <rect x="0" y="4" width="36" height="20" rx="3" fill="#0f172a" stroke={s.color} strokeWidth="1.2" />
                  <text x="18" y="18" fill="#cbd5e1" fontSize="8" textAnchor="middle">A</text>
                  <line x1="36" y1="14" x2="56" y2="14" stroke="#475569" strokeWidth="1.2" markerEnd={`url(#arr-${s.color.replace('#','')})`} />
                  <rect x="56" y="4" width="36" height="20" rx="3" fill="#0f172a" stroke={s.color} strokeWidth="1.2" />
                  <text x="74" y="18" fill="#cbd5e1" fontSize="8" textAnchor="middle">B</text>
                  <line x1="92" y1="14" x2="112" y2="14" stroke="#475569" strokeWidth="1.2" markerEnd={`url(#arr-${s.color.replace('#','')})`} />
                  <rect x="112" y="4" width="36" height="20" rx="3" fill="#0f172a" stroke={s.color} strokeWidth="1.2" />
                  <text x="130" y="18" fill="#f8fafc" fontSize="8" textAnchor="middle">{s.id === 's1' ? 'A?' : '?'}</text>
                  {/* Loopback arc */}
                  <path d="M148,6 A14,14 0 0,1 148,26 L140,26" stroke={s.color} strokeWidth="1.2" fill="none" markerEnd={`url(#arr-${s.color.replace('#','')})`} />
                  <text x="154" y="28" fill={s.color} fontSize="8">loop</text>
                </g>
              ) : s.icon === "reingest" ? (
                <g transform={`translate(${x + 18}, ${y + 80})`}>
                  <rect x="0" y="4" width="36" height="20" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
                  <text x="18" y="18" fill="#64748b" fontSize="8" textAnchor="middle">context</text>
                  <line x1="18" y1="24" x2="18" y2="38" stroke="#f43f5e" strokeWidth="1.2" markerEnd={`url(#arr-dn-f43f5e)`} />
                  <rect x="0" y="38" width="36" height="20" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
                  <text x="18" y="52" fill="#64748b" fontSize="8" textAnchor="middle">re-read</text>
                  <line x1="36" y1="48" x2="80" y2="48" stroke="#475569" strokeWidth="1.2" markerEnd={`url(#arr-h-f43f5e)`} />
                  <text x="84" y="52" fill="#94a3b8" fontSize="8">+tokens</text>
                </g>
              ) : s.icon === "spiral" ? (
                <g transform={`translate(${x + 18}, ${y + 82})`}>
                  <rect x="0" y="2" width="28" height="24" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
                  <text x="14" y="15" fill="#64748b" fontSize="7" textAnchor="middle">info ✓</text>
                  <line x1="28" y1="14" x2="60" y2="14" stroke="#475569" strokeWidth="1.2" strokeDasharray="3,2" />
                  <text x="66" y="18" fill="#94a3b8" fontSize="8">verify?</text>
                  <path d="M 60 14 Q 72 4 80 14 Q 88 24 76 28" stroke={s.color} strokeWidth="1.2" fill="none" markerEnd={`url(#arr-${s.color.replace('#','')})`} />
                  <text x="88" y="18" fill={s.color} fontSize="8">loop</text>
                </g>
              ) : (
                <g transform={`translate(${x + 18}, ${y + 82})`}>
                  <rect x="0" y="2" width="28" height="24" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
                  <text x="14" y="15" fill="#64748b" fontSize="7" textAnchor="middle">info ✓</text>
                  <line x1="28" y1="14" x2="64" y2="14" stroke="#475569" strokeWidth="1.2" strokeDasharray="4,2" />
                  <text x="68" y="18" fill="#94a3b8" fontSize="8">delay</text>
                  <line x1="64" y1="14" x2="64" y2="34" stroke={s.color} strokeWidth="1.2" markerEnd={`url(#arr-${s.color.replace('#','')})`} />
                  <rect x="64" y="34" width="56" height="20" rx="3" fill="#0f172a" stroke={s.color} strokeWidth="1.2" />
                  <text x="92" y="48" fill="#cbd5e1" fontSize="8" textAnchor="middle">action</text>
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
  const opusX = 88;   // high-BIS marker: near the verify end (left)
  const fableX = 320;  // high-BAS marker: near the act end (right)
  const barY = 128;

  return (
    <figure className="blog-figure blog-figure-chart">
      <figcaption>BIS/BAS calibration: the proposed EQ axis for agentic behavior</figcaption>
      <svg viewBox="0 0 760 260" role="img" aria-labelledby="bis-bas-title bis-bas-desc">
        <title id="bis-bas-title">BIS and BAS calibration spectrum</title>
        <desc id="bis-bas-desc">
          A single spectrum from Behavioral Inhibition System (verify, error-avoidance, rumination risk)
          through neutral to Behavioral Activation System (act, explore, course-correct, rumination risk low).
          Opus 5 calibrates toward the BIS end; Fable 5 toward the BAS end.
        </desc>
        <defs>
          {/* Blue → neutral → pink spectrum gradient */}
          <linearGradient id="bisbas-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          {/* Subtle glow under the spectrum bar */}
          <linearGradient id="bar-glow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.06" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.06" />
          </linearGradient>
          {/* Triangle arrowhead */}
          <marker id="arr-tri" viewBox="0 0 8 6" refX="8" refY="3" markerWidth="8" markerHeight="6" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#94a3b8" />
          </marker>
          {/* Arrowheads for model markers */}
          <marker id="arr-bis-tick" viewBox="0 0 8 6" refX="8" refY="3" markerWidth="7" markerHeight="5" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#38bdf8" />
          </marker>
          <marker id="arr-bas-tick" viewBox="0 0 8 6" refX="8" refY="3" markerWidth="7" markerHeight="5" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#ec4899" />
          </marker>
        </defs>

        {/* ── Title block ── */}
        <text x="380" y="44" fill="#f8fafc" fontSize="16" fontWeight="700" textAnchor="middle">
          Behavioral Calibration Spectrum
        </text>
        <text x="380" y="66" fill="#64748b" fontSize="12" textAnchor="middle">
          Inhibition ←—— → Activation
        </text>

        {/* ── Glow beneath bar ── */}
        <rect x="60" y={barY + 2} width="640" height="18" rx="9" fill="url(#bar-glow)" />

        {/* ── Spectrum bar: verify(blue) → neutral → act(pink) ── */}
        <rect x="60" y={barY} width="640" height="16" rx="8" fill="#1e293b" />
        <rect x="60" y={barY} width="640" height="16" rx="8" fill="url(#bisbas-grad)" />

        {/* ── End labels ── */}
        <text x="60" y={barY - 10} fill="#38bdf8" fontSize="12" fontWeight="600" textAnchor="middle">
          BIS · Verify
        </text>
        <text x="700" y={barY - 10} fill="#ec4899" fontSize="12" fontWeight="600" textAnchor="middle">
          BAS · Act
        </text>
        <text x="60" y={barY + 36} fill="#475569" fontSize="10" textAnchor="middle">
          Re-verify
        </text>
        <text x="380" y={barY + 36} fill="#475569" fontSize="10" textAnchor="middle">
          Neutral
        </text>
        <text x="700" y={barY + 36} fill="#475569" fontSize="10" textAnchor="middle">
          Course-correct
        </text>

        {/* ── Opus 5 marker (left/BIS side) ── */}
        <line x1={60 + opusX} y1={barY - 18} x2={60 + opusX} y2={barY + 34} stroke="#38bdf8" strokeWidth="1.5" />
        <circle cx={60 + opusX} cy={barY + 8} r="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
        <text x={60 + opusX} y={barY + 12} fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle">
          Opus 5
        </text>

        {/* ── Fable 5 marker (right/BAS side) ── */}
        <line x1={60 + fableX} y1={barY - 18} x2={60 + fableX} y2={barY + 34} stroke="#ec4899" strokeWidth="1.5" />
        <circle cx={60 + fableX} cy={barY + 8} r="8" fill="#0f172a" stroke="#ec4899" strokeWidth="2.5" />
        <text x={60 + fableX} y={barY + 12} fill="#ec4899" fontSize="9" fontWeight="bold" textAnchor="middle">
          Fable 5
        </text>

        {/* ── Behavioral outcome labels ── */}
        <rect x="60" y="190" width="320" height="52" rx="8" fill="#131c2e" />
        <rect x="60" y="190" width="4" height="52" rx="2" fill="#38bdf8" />
        <text x="84" y="214" fill="#f8fafc" fontSize="12" fontWeight="600">Opus 5 profile</text>
        <text x="84" y="232" fill="#94a3b8" fontSize="11">High BIS: re-verifies · loops · stalls</text>

        <rect x="380" y="190" width="320" height="52" rx="8" fill="#131c2e" />
        <rect x="380" y="190" width="4" height="52" rx="2" fill="#ec4899" />
        <text x="404" y="214" fill="#f8fafc" fontSize="12" fontWeight="600">Fable 5 profile</text>
        <text x="404" y="232" fill="#94a3b8" fontSize="11">High BAS: commits · course-corrects · moves</text>
      </svg>
      <p className="blog-svg-note">Illustrative framework from reinforcement sensitivity theory; applied to model behavior, not measured.</p>
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
