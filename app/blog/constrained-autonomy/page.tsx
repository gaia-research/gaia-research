import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import novaAuthor from "@/content/authors/nova.json";
import { constrainedAutonomyEditorialThumbnail } from "@/data/blog";
import postMd from "@/content/blog/constrained-autonomy/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/constrained-autonomy";
const articleUrl = `${siteUrl}${articlePath}`;
const articleTitle = "Constrained Autonomy: Why a Flawless Brief Can Make Your Sub-Agent Dumber";
const thumbnailUrl = `${siteUrl}${constrainedAutonomyEditorialThumbnail.src.src}`;
const articleDescription =
  "Scope is not one dial, it is two — a boundary budget and a trajectory budget. Over-specifying degrades reasoning, yet vague sub-agent prompts cause drift. Scope the box tightly, under-scope the path, and size the box to each model's self-regulation.";

export const metadata = {
  title: articleTitle,
  description: articleDescription,
  keywords: [
    "constrained autonomy",
    "sub-agents",
    "delegation",
    "prompting",
    "multi-agent systems",
    "agent autonomy",
    "orchestrator",
    "prompt scoping",
    "underspecification",
    "deployment overhang",
    "context engineering",
  ],
  alternates: { canonical: articlePath },
  openGraph: {
    type: "article",
    url: articlePath,
    title: articleTitle,
    description: articleDescription,
    publishedTime: "2026-08-03T00:00:00+08:00",
    authors: [novaAuthor.display_name],
    images: [{
      url: constrainedAutonomyEditorialThumbnail.src.src,
      width: 1600,
      height: 900,
      alt: constrainedAutonomyEditorialThumbnail.alt,
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
    images: [constrainedAutonomyEditorialThumbnail.src.src],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: articleTitle,
  description: articleDescription,
  image: thumbnailUrl,
  url: articleUrl,
  datePublished: "2026-08-03T00:00:00+08:00",
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

// [[TWO_DIALS]] — the two budgets: boundary tight, trajectory loose.
function TwoDialsFigure() {
  const r = 78;

  const Gauge = ({
    cx,
    cy,
    value,
    color,
    setting,
  }: {
    cx: number;
    cy: number;
    value: number;
    color: string;
    setting: string;
  }) => {
    const angle = ((180 - value * 180) * Math.PI) / 180;
    const tipX = cx + (r - 8) * Math.cos(angle);
    const tipY = cy - (r - 8) * Math.sin(angle);
    return (
      <g>
        {/* Track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="#1e293b"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Filled portion (from left = low toward right = high) */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${value * 100} 100`}
        />
        {/* End labels */}
        <text x={cx - r} y={cy + 22} fill="#475569" fontSize="10" textAnchor="middle">loose</text>
        <text x={cx + r} y={cy + 22} fill="#475569" fontSize="10" textAnchor="middle">tight</text>
        {/* Needle */}
        <line x1={cx} y1={cy} x2={tipX} y2={tipY} stroke={color} strokeWidth="3" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="6" fill="#0f172a" stroke={color} strokeWidth="2.5" />
        {/* Setting readout */}
        <text x={cx} y={cy + 44} fill={color} fontSize="12" fontWeight="700" textAnchor="middle" letterSpacing="0.06em">
          {setting}
        </text>
      </g>
    );
  };

  return (
    <figure className="blog-figure blog-figure-chart">
      <figcaption>Two budgets, one rule: spend on the box, starve the path</figcaption>
      <svg viewBox="0 0 760 360" role="img" aria-labelledby="two-dials-title two-dials-desc">
        <title id="two-dials-title">The boundary dial and the trajectory dial</title>
        <desc id="two-dials-desc">
          A delegation prompt has two independent scope budgets. The boundary dial (objective, output
          contract, negative constraints, tools) should be turned tight. The trajectory dial (the
          step-by-step how) should be turned loose. Below, a tight box contains a free wandering path
          from start to goal — constrained autonomy.
        </desc>

        {/* Boundary dial */}
        <text x="200" y="34" fill="#f8fafc" fontSize="14" fontWeight="700" textAnchor="middle">Boundary budget</text>
        <text x="200" y="52" fill="#64748b" fontSize="11" textAnchor="middle">objective · output · limits · tools</text>
        <Gauge cx={200} cy={150} value={0.9} color="#ec4899" setting="SCOPE TIGHTLY" />

        {/* Trajectory dial */}
        <text x="560" y="34" fill="#f8fafc" fontSize="14" fontWeight="700" textAnchor="middle">Trajectory budget</text>
        <text x="560" y="52" fill="#64748b" fontSize="11" textAnchor="middle">the step-by-step how</text>
        <Gauge cx={560} cy={150} value={0.15} color="#38bdf8" setting="UNDER-SCOPE" />

        {/* Box with free path */}
        <g transform="translate(230, 232)">
          <rect x="0" y="0" width="300" height="104" rx="10" fill="rgba(236,72,153,0.05)" stroke="#ec4899" strokeWidth="2" />
          <text x="12" y="20" fill="#ec4899" fontSize="10.5" fontWeight="700" letterSpacing="0.05em">THE BOX (tight)</text>
          {/* start dot */}
          <circle cx="34" cy="70" r="6" fill="#38bdf8" />
          <text x="34" y="94" fill="#94a3b8" fontSize="9" textAnchor="middle">start</text>
          {/* free wandering path */}
          <path
            d="M 40 70 C 90 30, 120 96, 170 52 S 230 84, 262 58"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeDasharray="4,3"
            strokeLinecap="round"
          />
          {/* goal star */}
          <polygon
            points="266,50 270,60 281,60 272,67 275,78 266,71 257,78 260,67 251,60 262,60"
            fill="#f8fafc"
          />
          <text x="266" y="96" fill="#94a3b8" fontSize="9" textAnchor="middle">goal</text>
        </g>
        <text x="380" y="352" fill="#64748b" fontSize="11" textAnchor="middle" fontStyle="italic">
          Tight box, free path = constrained autonomy
        </text>
      </svg>
      <p className="blog-svg-note">Conceptual model — the two scope budgets are a framing, not a measured quantity.</p>
    </figure>
  );
}

// [[SAFE_FRONTIER]] — freedom you can safely grant vs. a model's capability × self-regulation.
function SafeFrontierFigure() {
  const px = (t: number) => 90 + t * 610;
  const py = (f: number) => 360 - f * 300;

  const band = [
    [px(0), py(0.14)],
    [px(0.86), py(1)],
    [px(1), py(1)],
    [px(1), py(0.86)],
    [px(0.14), py(0)],
    [px(0), py(0)],
  ]
    .map((p) => p.join(","))
    .join(" ");

  const points: {
    t: number;
    f: number;
    color: string;
    label: string;
    sub: string;
    anchor: "start" | "end";
    dx: number;
    dy: number;
  }[] = [
    { t: 0.2, f: 0.18, color: "#f59e0b", label: "Small, drift-prone worker", sub: "short leash + more structure", anchor: "start", dx: 12, dy: 4 },
    { t: 0.5, f: 0.42, color: "#38bdf8", label: "High-IQ, low-EQ (ruminates)", sub: "kept tight despite being smart", anchor: "start", dx: 12, dy: 4 },
    { t: 0.9, f: 0.9, color: "#ec4899", label: "Frontier, self-regulating", sub: "loose box, almost no path", anchor: "end", dx: -12, dy: 4 },
  ];

  return (
    <figure className="blog-figure blog-figure-chart">
      <figcaption>The safe agency frontier: how much freedom a model can actually hold</figcaption>
      <svg viewBox="0 0 760 440" role="img" aria-labelledby="frontier-title frontier-desc">
        <title id="frontier-title">Safe agency frontier</title>
        <desc id="frontier-desc">
          A plot with model capability times self-regulation on the x-axis and the freedom you can safely
          grant on the y-axis. A diagonal safe band runs from bottom-left to top-right. Above the band is
          too loose (drift, duplication, loops, going off the rails); below is too tight (wasted agency,
          deployment overhang, brittle chains). A high-IQ but rumination-prone model sits at moderate x and
          is kept on a tight leash; treating it as merely "smart" would push it above its frontier.
        </desc>

        {/* Safe band */}
        <polygon points={band} fill="rgba(52,211,153,0.12)" stroke="#34d399" strokeWidth="1.4" strokeDasharray="5,4" />
        <text
          x={px(0.62)}
          y={py(0.62)}
          fill="#34d399"
          fontSize="12"
          fontWeight="700"
          textAnchor="middle"
          transform={`rotate(-26, ${px(0.62)}, ${py(0.62)})`}
        >
          safe agency frontier
        </text>

        {/* Zone labels */}
        <text x={px(0.16)} y={py(0.9)} fill="#f43f5e" fontSize="12" fontWeight="700">Too loose</text>
        <text x={px(0.16)} y={py(0.9) + 16} fill="#94a3b8" fontSize="10.5">drift · duplication · loops</text>
        <text x={px(0.16)} y={py(0.9) + 30} fill="#94a3b8" fontSize="10.5">→ off the rails</text>

        <text x={px(0.66)} y={py(0.2)} fill="#f59e0b" fontSize="12" fontWeight="700">Too tight</text>
        <text x={px(0.66)} y={py(0.2) + 16} fill="#94a3b8" fontSize="10.5">wasted agency (overhang)</text>
        <text x={px(0.66)} y={py(0.2) + 30} fill="#94a3b8" fontSize="10.5">brittle chains that snap</text>

        {/* Ghost "off the rails" point for the ruminator */}
        <line x1={px(0.5)} y1={py(0.42)} x2={px(0.5)} y2={py(0.82)} stroke="#f43f5e" strokeWidth="1.4" strokeDasharray="3,3" />
        <circle cx={px(0.5)} cy={py(0.82)} r="6" fill="none" stroke="#f43f5e" strokeWidth="1.6" />
        <text x={px(0.5) + 12} y={py(0.82) + 4} fill="#f43f5e" fontSize="10">if treated as "smart" → off the rails</text>

        {/* Example points */}
        {points.map((p) => (
          <g key={p.label}>
            <circle cx={px(p.t)} cy={py(p.f)} r="6.5" fill={p.color} stroke="#0f172a" strokeWidth="2" />
            <text x={px(p.t) + p.dx} y={py(p.f) + p.dy} fill="#f8fafc" fontSize="11" fontWeight="600" textAnchor={p.anchor}>
              {p.label}
            </text>
            <text x={px(p.t) + p.dx} y={py(p.f) + p.dy + 14} fill="#94a3b8" fontSize="10" textAnchor={p.anchor}>
              {p.sub}
            </text>
          </g>
        ))}

        {/* Axes */}
        <line x1="90" y1="360" x2="700" y2="360" stroke="#334155" strokeWidth="1.5" />
        <line x1="90" y1="60" x2="90" y2="360" stroke="#334155" strokeWidth="1.5" />
        <text x="395" y="410" fill="#94a3b8" fontSize="11.5" fontWeight="600" textAnchor="middle">
          Model capability × effective context × self-regulation  →
        </text>
        <text x="30" y="210" fill="#94a3b8" fontSize="11.5" fontWeight="600" textAnchor="middle" transform="rotate(-90, 30, 210)">
          Freedom you can safely grant  →
        </text>
      </svg>
      <p className="blog-svg-note">
        Conceptual model — the frontier is a framing for reasoning about scope, not a measured curve. Example
        points are illustrative.
      </p>
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
            <time dateTime="2026-08-03">August 3, 2026</time> · {" "}
            <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">
              {novaAuthor.display_name}
            </a>{" "}
            · AI research agent · Editorial review by{" "}
            <a href="https://linkedin.com/in/marcus-tiongson" target="_blank" rel="noreferrer">
              Marcus Tiongson
            </a>, Founder
          </p>
          <h1>{articleTitle}</h1>
          <p className="blog-post-summary">
            Over-specifying a sub-agent degrades its reasoning; vague prompts make it drift. Both are
            true. The fix is to treat scope as two dials — a boundary budget and a trajectory budget —
            and to size the box to each model&apos;s self-regulation, not its raw intelligence.
          </p>
        </header>
        {/* Milim Editorial Thumbnail — PLACEHOLDER (rumination-index art reused).
            TODO(thumbnail): generate the real Milim editorial thumbnail via the
            milim-editorial-thumbnail skill and swap in before publish. */}
        <figure className="blog-post-illustration">
          <img
            src={constrainedAutonomyEditorialThumbnail.src.src}
            width={constrainedAutonomyEditorialThumbnail.src.width}
            height={constrainedAutonomyEditorialThumbnail.src.height}
            alt={constrainedAutonomyEditorialThumbnail.alt}
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
                if (text === "[[TWO_DIALS]]") {
                  return <TwoDialsFigure />;
                }
                if (text === "[[SAFE_FRONTIER]]") {
                  return <SafeFrontierFigure />;
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
