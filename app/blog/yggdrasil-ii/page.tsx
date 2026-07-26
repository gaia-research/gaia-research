import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import novaAuthor from "@/content/authors/nova.json";
import { yggdrasilIiThumbnail } from "@/data/blog";
import postMd from "@/content/blog/yggdrasil-ii/post.md";
import rankSuite4 from "@/assets/generated/yggdrasil-ii-ranks/rank-suite-4-extra.webp";
import rankSuite5 from "@/assets/generated/yggdrasil-ii-ranks/rank-suite-5-ultimate.webp";
import rankSuite6 from "@/assets/generated/yggdrasil-ii-ranks/rank-suite-6-apex.webp";
import rankUnique4 from "@/assets/generated/yggdrasil-ii-ranks/rank-unique-4.webp";
import rankUnique5 from "@/assets/generated/yggdrasil-ii-ranks/rank-unique-5-ultimate.webp";
import rankUnique6 from "@/assets/generated/yggdrasil-ii-ranks/rank-unique-6-impossible.webp";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/yggdrasil-ii";
const articleUrl = `${siteUrl}${articlePath}`;
const thumbnailUrl = `${siteUrl}${yggdrasilIiThumbnail.src.src}`;
const articleDescription =
  "Yggdrasil II rebuilds the Gaia Skill Tree around simpler structure and weighted evidence: four node types collapse to two, a branch view is computed from the graph, and Trust Magnitude replaces a popularity gate.";

export const metadata = {
  title: "Yggdrasil II: The Skill Tree Stops Storing What It Can Compute — Gaia Research",
  description: articleDescription,
  keywords: [
    "Yggdrasil II",
    "Gaia Skill Tree",
    "skill taxonomy",
    "Trust Magnitude",
    "derived fields",
    "schema design",
    "agent skills",
    "Gaia Research",
  ],
  alternates: { canonical: articlePath },
  openGraph: {
    type: "article",
    url: articlePath,
    title: "Yggdrasil II: The Skill Tree Stops Storing What It Can Compute",
    description: articleDescription,
    publishedTime: "2026-07-27T00:00:00+08:00",
    authors: [novaAuthor.display_name],
    images: [{ url: yggdrasilIiThumbnail.src.src, width: 1600, height: 900, alt: yggdrasilIiThumbnail.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yggdrasil II: The Skill Tree Stops Storing What It Can Compute",
    description: articleDescription,
    images: [yggdrasilIiThumbnail.src.src],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Yggdrasil II: The Skill Tree Stops Storing What It Can Compute",
  description: articleDescription,
  image: thumbnailUrl,
  url: articleUrl,
  datePublished: "2026-07-27T00:00:00+08:00",
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

function BranchDerivationFlowchart() {
  return (
    <figure className="blog-figure blog-figure-chart">
      <figcaption>
        Figure 1. branch = f(suiteComponents present?, rank) — evaluated at read time, stored nowhere.
      </figcaption>
      <svg viewBox="0 0 640 210" role="img" aria-label="Branch derivation decision flow" style={{ width: "100%", height: "auto" }}>
        <defs>
          <marker id="ygg-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#38bdf8" />
          </marker>
        </defs>

        {/* Decision 1: suiteComponents? */}
        <rect x="20" y="80" width="150" height="60" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
        <text x="95" y="106" textAnchor="middle" fill="#f0f1f5" fontSize="12" fontWeight="bold" fontFamily="monospace">suiteComponents</text>
        <text x="95" y="124" textAnchor="middle" fill="#38bdf8" fontSize="11" fontFamily="monospace">present?</text>

        {/* yes -> suite */}
        <path d="M 170,95 L 250,55" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#ygg-arrow)" />
        <text x="200" y="62" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">yes</text>
        <rect x="250" y="30" width="150" height="50" rx="6" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
        <text x="325" y="52" textAnchor="middle" fill="#fbbf24" fontSize="13" fontWeight="bold" fontFamily="monospace">suite</text>
        <text x="325" y="69" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">any rank</text>

        {/* no -> rank check */}
        <path d="M 170,125 L 250,150" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#ygg-arrow)" />
        <text x="200" y="150" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">no</text>
        <rect x="250" y="120" width="150" height="60" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
        <text x="325" y="146" textAnchor="middle" fill="#f0f1f5" fontSize="12" fontWeight="bold" fontFamily="monospace">rank</text>
        <text x="325" y="164" textAnchor="middle" fill="#38bdf8" fontSize="11" fontFamily="monospace">&ge; 4?</text>

        {/* rank<4 -> standard */}
        <path d="M 400,135 L 480,55" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#ygg-arrow)" />
        <text x="452" y="90" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">1&ndash;3</text>
        <rect x="480" y="30" width="140" height="50" rx="6" fill="#0f172a" stroke="#8c90aa" strokeWidth="1.5" />
        <text x="550" y="52" textAnchor="middle" fill="#c7cbe0" fontSize="13" fontWeight="bold" fontFamily="monospace">standard</text>
        <text x="550" y="69" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">rank 1&ndash;3</text>

        {/* rank>=4 -> unique */}
        <path d="M 400,165 L 480,150" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#ygg-arrow)" />
        <text x="452" y="172" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">&ge; 4</text>
        <rect x="480" y="120" width="140" height="50" rx="6" fill="#0f172a" stroke="#e0894a" strokeWidth="1.5" />
        <text x="550" y="142" textAnchor="middle" fill="#e0894a" fontSize="13" fontWeight="bold" fontFamily="monospace">unique</text>
        <text x="550" y="159" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">climbed alone</text>
      </svg>
      <p className="blog-svg-note">
        Two inputs, three branches, no stored copy. <code>suiteComponents</code> presence is checked first, then rank. The same function runs on every read, so the site and the registry can never disagree about a skill&apos;s branch.
      </p>
    </figure>
  );
}

function TrustGradeChart() {
  // Live distribution across 249 named skills (verified against the registry):
  // S=4, A=42, B=56, C=76, ungraded=71.
  const bars = [
    { label: "S", count: 4, color: "#fbbf24" },
    { label: "A", count: 42, color: "#38bdf8" },
    { label: "B", count: 56, color: "#38bdf8" },
    { label: "C", count: 76, color: "#ec4899" },
    { label: "ungraded", count: 71, color: "#545770" },
  ];
  const max = 76;
  const chartTop = 30;
  const baseline = 175;
  const usable = baseline - chartTop; // 145px for the tallest bar
  const slotWidth = 116;
  const barWidth = 54;
  const xStart = 70;

  return (
    <figure className="blog-figure blog-figure-chart">
      <figcaption>
        Figure 2. Trust Magnitude grade distribution across 249 named skills (live registry).
      </figcaption>
      <svg viewBox="0 0 640 210" role="img" aria-label="Trust grade distribution across 249 named skills" style={{ width: "100%", height: "auto" }}>
        {/* baseline */}
        <line x1="50" y1={baseline} x2="620" y2={baseline} stroke="#334155" />

        {bars.map((b, i) => {
          const h = Math.round((b.count / max) * usable);
          const x = xStart + i * slotWidth;
          const y = baseline - h;
          return (
            <g key={b.label}>
              <rect x={x} y={y} width={barWidth} height={h} rx="3" fill={b.color} opacity={b.label === "ungraded" ? 0.7 : 0.9} />
              <text x={x + barWidth / 2} y={y - 7} textAnchor="middle" fill={b.color} fontSize="13" fontWeight="bold" fontFamily="monospace">{b.count}</text>
              <text x={x + barWidth / 2} y={baseline + 18} textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="monospace">{b.label}</text>
            </g>
          );
        })}
      </svg>
      <p className="blog-svg-note">
        S is scarce by design: it requires TM &ge; 250 <em>and</em> at least three distinct evidence types, one of which cannot be self-produced. Only four skills clear it. No 6&#9733; Apex or Unique Impossible has been reached yet.
      </p>
    </figure>
  );
}

function RankLadderFigure() {
  const suite = [
    { src: rankSuite4, rank: "4★", name: "Extra", note: "dwarf star" },
    { src: rankSuite5, rank: "5★", name: "Ultimate", note: "burning sun" },
    { src: rankSuite6, rank: "6★", name: "Apex", note: "supernova" },
  ];
  const unique = [
    { src: rankUnique4, rank: "4★", name: "Unique", note: "rooted void" },
    { src: rankUnique5, rank: "5★", name: "Unique Ultimate", note: "accretion ring" },
    { src: rankUnique6, rank: "6★", name: "Unique Impossible", note: "singularity" },
  ];

  const Row = ({
    label,
    accent,
    tiers,
  }: {
    label: string;
    accent: string;
    tiers: { src: { src: string }; rank: string; name: string; note: string }[];
  }) => (
    <div className="rank-ladder-row">
      <p className="rank-ladder-branch" style={{ color: accent }}>{label}</p>
      <div className="rank-ladder-tiers">
        {tiers.map((t) => (
          <figure key={t.name} className="rank-ladder-tier">
            <img src={t.src.src} alt={`${label} branch, ${t.rank} ${t.name} medallion`} loading="lazy" />
            <figcaption>
              <span className="rank-ladder-rank" style={{ color: accent }}>{t.rank} {t.name}</span>
              <span className="rank-ladder-note">{t.note}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );

  return (
    <figure className="blog-figure blog-figure-ranks">
      <figcaption>
        Figure 3. The 4★ fork, rendered. Suite emits outward (gold); Unique collapses inward (amethyst→ember). Medallion art from the Gaia Skill Tree Ascension Overdrive family.
      </figcaption>
      <div className="rank-ladder">
        <Row label="Suite" accent="#fbbf24" tiers={suite} />
        <Row label="Unique" accent="#e0894a" tiers={unique} />
      </div>
      <p className="blog-svg-note">
        Both branches share one antique medallion chassis. Rank sets the color; the derived branch sets the cosmology — the same fact the registry now computes instead of stores.
      </p>
    </figure>
  );
}

function loadPost() {
  // Slices the h1 title line, blank line, byline, and blank line (indices 0–3)
  // so the page <h1> renders from metadata, not duplicated from the markdown.
  return postMd.split("\n").slice(4).join("\n").trim();
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
        <header className="blog-post-head border-b border-slate-800/60 pb-8 mb-8">
          <p className="blog-post-meta text-sm text-slate-400 mb-2">
            <time dateTime="2026-07-27">July 27, 2026</time> · Field Note by{" "}
            <a href={novaAuthor.links.github} target="_blank" rel="noreferrer" className="text-sky-400 font-medium hover:underline">
              {novaAuthor.display_name}
            </a>{" "}
            — Head Researcher, Gaia Research
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 my-3">
            Yggdrasil II: The Skill Tree Stops Storing What It Can Compute
          </h1>
          <p className="blog-post-summary text-lg text-slate-400">
            Gaia Skill Tree maps what AI agents can do, who demonstrated it, and what evidence supports it. Yggdrasil II makes that record simpler.
          </p>
        </header>

        <figure className="blog-post-illustration my-8 rounded-xl overflow-hidden border border-slate-800 shadow-xl">
          <img
            src={yggdrasilIiThumbnail.src.src}
            width={yggdrasilIiThumbnail.src.width}
            height={yggdrasilIiThumbnail.src.height}
            alt={yggdrasilIiThumbnail.alt}
            className="w-full h-auto object-cover"
          />
        </figure>

        <article className="blog-post-body report-body">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ children, ...props }) => (
                <div className="overflow-x-auto my-6 border border-slate-800 rounded-lg">
                  <table className="w-full text-left text-sm" {...props}>
                    {children}
                  </table>
                </div>
              ),
              pre: ({ children, ...props }) => (
                <pre className="overflow-x-auto my-6 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm font-mono text-slate-200" {...props}>
                  {children}
                </pre>
              ),
              blockquote: ({ children, ...props }) => (
                <blockquote className="border-l-2 border-sky-400 bg-slate-900/50 px-4 py-3 rounded-r-lg my-6 text-slate-300 italic" {...props}>
                  {children}
                </blockquote>
              ),
              code: ({ children, ...props }) => {
                const text = Array.isArray(children) ? children.join("") : typeof children === "string" ? children : "";
                if (text.includes("\n")) {
                  return <code {...props}>{children}</code>;
                }
                return <code className="bg-slate-900 border border-slate-800 text-sky-300 rounded px-1.5 py-0.5 text-xs font-mono" {...props}>{children}</code>;
              },
              p: ({ children, ...props }) => {
                const text = Array.isArray(children) ? children.join("") : typeof children === "string" ? children : "";
                if (text === "[[BRANCH_DERIVATION_FLOWCHART]]") {
                  return <BranchDerivationFlowchart />;
                }
                if (text === "[[TRUST_GRADE_CHART]]") {
                  return <TrustGradeChart />;
                }
                if (text === "[[RANK_LADDER]]") {
                  return <RankLadderFigure />;
                }
                return <p {...props}>{children}</p>;
              },
            }}
          >
            {body}
          </Markdown>
        </article>

        <footer className="blog-post-foot mt-16 pt-8 border-t border-slate-800">
          <Link href="/blog" className="text-sky-400 font-medium hover:underline inline-flex items-center gap-2 min-h-[44px] px-2 py-1">
            ← Back to Blog
          </Link>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
