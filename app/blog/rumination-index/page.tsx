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
  "Opus 5 is half the price of Fable 5. The difference is not capability — it is rumination. Opus 5 overthinks; Fable 5 acts with higher agentic EQ and intentionality.";

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
    { label: "Repeated tool calls", desc: "Same or paraphrased call within short window" },
    { label: "Context re-ingestion", desc: "Tokens re-reading already-processed blocks" },
    { label: "Self-confirmation spirals", desc: "'Let me verify' → 'Let me double-check'" },
    { label: "Decision latency", desc: "Gap between sufficient info and first action" },
  ];

  return (
    <figure className="blog-figure blog-figure-chart">
      <figcaption>Four observable signals of agentic rumination in harness logs</figcaption>
      <svg viewBox="0 0 760 340" role="img" aria-labelledby="rumination-signals-title rumination-signals-desc">
        <title id="rumination-signals-title">Rumination signals</title>
        <desc id="rumination-signals-desc">
          Repeated tool calls, context re-ingestion, self-confirmation spirals, and decision latency are four
          behavioral signatures of rumination visible in harness logs without model cooperation.
        </desc>
        {signals.map((signal, index) => {
          const y = 18 + index * 76;
          return (
            <g key={signal.label}>
              <rect x="20" y={y} width="720" height="60" rx="8" fill="#111827" stroke="#334155" />
              <rect x="20" y={y} width="6" height="60" rx="3" fill="#ec4899" />
              <text x="48" y={y + 28} fill="#f8fafc" fontSize="16" fontWeight="bold">{signal.label}</text>
              <text x="48" y={y + 48} fill="#94a3b8" fontSize="14">{signal.desc}</text>
            </g>
          );
        })}
      </svg>
      <p className="blog-svg-note">Conceptual framework — no measured data. Signals are proposed for future validation.</p>
    </figure>
  );
}

function BisBasFigure() {
  return (
    <figure className="blog-figure blog-figure-chart">
      <figcaption>BIS/BAS calibration: the proposed EQ axis for agentic behavior</figcaption>
      <svg viewBox="0 0 760 280" role="img" aria-labelledby="bis-bas-title bis-bas-desc">
        <title id="bis-bas-title">BIS and BAS axes</title>
        <desc id="bis-bas-desc">
          Behavioral Inhibition System signals caution and error-avoidance; Behavioral Activation System signals
          exploration and action. The balance between them predicts rumination versus commitment.
        </desc>
        <rect x="20" y="20" width="344" height="220" rx="10" fill="#111827" stroke="#38bdf8" />
        <rect x="396" y="20" width="344" height="220" rx="10" fill="#111827" stroke="#ec4899" />
        <text x="44" y="58" fill="#38bdf8" fontSize="13" fontFamily="monospace">HIGH BIS</text>
        <text x="420" y="58" fill="#ec4899" fontSize="13" fontFamily="monospace">HIGH BAS</text>
        <text x="44" y="92" fill="#f8fafc" fontSize="20">Verify everything</text>
        <text x="420" y="92" fill="#f8fafc" fontSize="20">Commit and course-correct</text>
        <text x="44" y="130" fill="#cbd5e1" fontSize="14">Avoids errors</text>
        <text x="44" y="152" fill="#cbd5e1" fontSize="14">Stalls progress</text>
        <text x="420" y="130" fill="#cbd5e1" fontSize="14">Moves fast</text>
        <text x="420" y="152" fill="#cbd5e1" fontSize="14">May miss edge cases</text>
        <text x="44" y="210" fill="#94a3b8" fontSize="14">Rumination risk: HIGH</text>
        <text x="420" y="210" fill="#94a3b8" fontSize="14">Rumination risk: LOW</text>
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
            Opus 5 costs half of Fable 5. The difference is not capability — it is rumination. Opus 5 overthinks; Fable 5 acts with higher agentic EQ and intentionality. A proposed Rumination Index grounded in existing psych constructs.
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
