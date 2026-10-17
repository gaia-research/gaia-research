import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import PostShareBar from "@/components/PostShareBar";
import marcusAuthor from "@/content/authors/marcus.json";
import { ifEverythingCanBeRecreatedThumbnail } from "@/data/blog";
import postMd from "@/content/blog/if-everything-can-be-recreated/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/if-everything-can-be-recreated";
const articleUrl = `${siteUrl}${articlePath}`;
const thumbnailUrl = `${siteUrl}${ifEverythingCanBeRecreatedThumbnail.src.src}`;
const articleTitle = "If Everything Can Be Recreated, Who Gets Remembered?";
const articleDescription =
  "When AI agents make software implementation reproducible on demand, original authorship does not disappear. Why Gaia Skill Tree and Yggdrasil preserve verifiable lineage and evidence-backed trust.";
const publishedTime = "2026-10-18T00:00:00+08:00";

export const metadata = {
  title: articleTitle,
  description: articleDescription,
  keywords: [
    "software authorship",
    "reverse engineering",
    "Reverse Engineer Anything",
    "attribution",
    "Gaia Skill Tree",
    "Yggdrasil",
    "post-scarcity code",
    "open source provenance",
    "Gaia Research",
  ],
  alternates: { canonical: articlePath },
  openGraph: {
    type: "article",
    url: articlePath,
    title: articleTitle,
    description: articleDescription,
    publishedTime,
    authors: [marcusAuthor.display_name],
    images: [
      {
        url: ifEverythingCanBeRecreatedThumbnail.src.src,
        width: 1600,
        height: 900,
        alt: ifEverythingCanBeRecreatedThumbnail.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
    images: [ifEverythingCanBeRecreatedThumbnail.src.src],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: articleTitle,
  description: articleDescription,
  image: thumbnailUrl,
  url: articleUrl,
  datePublished: publishedTime,
  author: {
    "@type": "Person",
    name: marcusAuthor.display_name,
    url: marcusAuthor.links.github,
  },
  publisher: {
    "@type": "Organization",
    name: "Gaia Research",
    url: siteUrl,
  },
};

function loadPost() {
  // Strip the title and byline; the header below renders them.
  return postMd.split("\n").slice(4).join("\n").trim();
}

const figureStyle = { width: "100%", maxWidth: 560, margin: "2rem auto" };
const svgStyle = { display: "block", width: "100%", height: "auto" };

function DualAxisProvenanceSvg() {
  return (
    <figure className="blog-post-figure" style={figureStyle}>
      <svg
        viewBox="0 0 600 450"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="dual-axis-title dual-axis-desc"
        style={svgStyle}
      >
        <title id="dual-axis-title">The Dual-Axis Recognition Model</title>
        <desc id="dual-axis-desc">
          Separating immutable historical provenance from earned operational trust and verification evidence.
        </desc>

        {/* Card Canvas */}
        <rect width="600" height="450" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

        {/* Header */}
        <text x="300" y="34" textAnchor="middle" fill="#f8fafc" fontSize="19" fontWeight="700">
          The Dual-Axis Recognition Model
        </text>
        <text x="300" y="54" textAnchor="middle" fill="#94a3b8" fontSize="13">
          Separating Immutable Lineage from Earned Operational Trust
        </text>

        {/* Quadrant grid background */}
        <rect x="70" y="75" width="225" height="150" rx="10" fill="#0b1120" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 3" />
        <rect x="305" y="75" width="225" height="150" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
        <rect x="70" y="235" width="225" height="145" rx="10" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
        <rect x="305" y="235" width="225" height="145" rx="10" fill="#0b1120" stroke="#ec4899" strokeWidth="1.2" strokeDasharray="3 3" />

        {/* Top-Right: Canon Pillar (High Provenance + High Trust) */}
        <g transform="translate(315, 85)">
          <rect x="0" y="0" width="205" height="24" rx="4" fill="#38bdf8" fillOpacity="0.15" />
          <text x="8" y="17" fill="#38bdf8" fontSize="14" fontWeight="700">CANON PILLAR</text>
          <text x="8" y="44" fill="#f1f5f9" fontSize="13" fontWeight="600">Originator + Maintainer</text>
          <text x="8" y="66" fill="#94a3b8" fontSize="13">Original creator who keeps</text>
          <text x="8" y="85" fill="#94a3b8" fontSize="13">testing, verifying, and</text>
          <text x="8" y="104" fill="#94a3b8" fontSize="13">hardening execution.</text>
          <text x="8" y="126" fill="#38bdf8" fontSize="13" fontWeight="600">Status: Highest Prestige</text>
        </g>

        {/* Top-Left: Disciplined Steward (Derived + High Trust) */}
        <g transform="translate(80, 85)">
          <rect x="0" y="0" width="205" height="24" rx="4" fill="#fbbf24" fillOpacity="0.15" />
          <text x="8" y="17" fill="#fbbf24" fontSize="14" fontWeight="700">TRUSTED STEWARD</text>
          <text x="8" y="44" fill="#f1f5f9" fontSize="13" fontWeight="600">Improver / Fixer</text>
          <text x="8" y="66" fill="#94a3b8" fontSize="13">Did not invent the idea, but</text>
          <text x="8" y="85" fill="#94a3b8" fontSize="13">fixed edge cases, CI tests,</text>
          <text x="8" y="104" fill="#94a3b8" fontSize="13">and runtime reliability.</text>
          <text x="8" y="126" fill="#fbbf24" fontSize="13" fontWeight="600">Status: High Trust Magnitude</text>
        </g>

        {/* Bottom-Right: Historical Pioneer (High Provenance + Untested/Stagnant) */}
        <g transform="translate(315, 245)">
          <rect x="0" y="0" width="205" height="24" rx="4" fill="#ec4899" fillOpacity="0.15" />
          <text x="8" y="17" fill="#ec4899" fontSize="14" fontWeight="700">HISTORICAL PIONEER</text>
          <text x="8" y="44" fill="#f1f5f9" fontSize="13" fontWeight="600">Original Discoverer</text>
          <text x="8" y="66" fill="#94a3b8" fontSize="13">First to uncover the pattern.</text>
          <text x="8" y="85" fill="#94a3b8" fontSize="13">Immutable attribution stays</text>
          <text x="8" y="104" fill="#94a3b8" fontSize="13">permanent even if unkept.</text>
          <text x="8" y="124" fill="#ec4899" fontSize="13" fontWeight="600">Status: Permanent Credit</text>
        </g>

        {/* Bottom-Left: Ephemeral Echo (Low Provenance + Untested) */}
        <g transform="translate(80, 245)">
          <rect x="0" y="0" width="205" height="24" rx="4" fill="#334155" fillOpacity="0.3" />
          <text x="8" y="17" fill="#64748b" fontSize="14" fontWeight="700">EPHEMERAL REPLICA</text>
          <text x="8" y="44" fill="#94a3b8" fontSize="13" fontWeight="600">Fast Prompt / Unverified</text>
          <text x="8" y="66" fill="#64748b" fontSize="13">Trivial LLM copies and raw</text>
          <text x="8" y="85" fill="#64748b" fontSize="13">star-hype without tests</text>
          <text x="8" y="104" fill="#64748b" fontSize="13">or operational verification.</text>
          <text x="8" y="124" fill="#ef4444" fontSize="13" fontWeight="600">Status: Zero Trust Floor</text>
        </g>

        {/* Coordinate Labels and Arrows */}
        <g fill="#94a3b8" fontSize="13" fontWeight="600">
          {/* Y Axis Label */}
          <text x="40" y="210" textAnchor="middle" transform="rotate(-90 40 210)" fill="#38bdf8">
            Earned Operational Trust (Evidence) →
          </text>
          {/* X Axis Label */}
          <text x="300" y="405" textAnchor="middle" fill="#ec4899">
            Historical Lineage (Original Discovery) →
          </text>
        </g>

        {/* Provenance note */}
        <text x="300" y="432" textAnchor="middle" fill="#64748b" fontSize="13">
          Conceptual framework · not benchmark data
        </text>
      </svg>
    </figure>
  );
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
            <time dateTime="2026-10-18">October 18, 2026</time> ·{" "}
            <a href={marcusAuthor.links.github} target="_blank" rel="noreferrer">
              {marcusAuthor.display_name}
            </a>{" "}
            · Founder, Gaia Research
          </p>
          <h1>{articleTitle}</h1>
          <p className="blog-post-summary">
            AI may make software reproducible without making its creators disposable. Why easily generated code still deserves verifiable intellectual lineage.
          </p>
        </header>

        <figure className="blog-post-illustration">
          <img
            src={ifEverythingCanBeRecreatedThumbnail.src.src}
            width={ifEverythingCanBeRecreatedThumbnail.src.width}
            height={ifEverythingCanBeRecreatedThumbnail.src.height}
            alt={ifEverythingCanBeRecreatedThumbnail.alt}
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

                if (text === "[[DUAL_AXIS_PROVENANCE_SVG]]") {
                  return <DualAxisProvenanceSvg />;
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
