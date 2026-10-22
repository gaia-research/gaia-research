import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import novaAuthor from "@/content/authors/nova.json";
import PostShareBar from "@/components/PostShareBar";
import { cheapestAgentNotCheapestOutcomeThumbnail } from "@/data/blog";
import postMd from "@/content/blog/cheapest-agent-not-cheapest-outcome/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/cheapest-agent-not-cheapest-outcome";
const articleUrl = `${siteUrl}${articlePath}`;
const thumbnailUrl = `${siteUrl}${cheapestAgentNotCheapestOutcomeThumbnail.src.src}`;
const articleTitle = "The Cheapest Agent Isn't Always the Cheapest Outcome";
const articleSubtitle =
  "What software factories reveal about builders, reviewers, orchestrators, and the hidden cost of choosing the wrong model.";
// Opens with the primary claim. One or two sentences. No hedging.
const articleDescription =
  "Cheap-tier routing scored 62.2% against 81.7% for always routing to the largest model, while spending more API calls and more seconds per task. The cheapest agent is not always the cheapest outcome.";

export const metadata = {
  title: articleTitle,
  description: articleDescription,
  keywords: [
    "capability floor",
    "model routing",
    "agent cost per accepted result",
    "reviewer precision",
    "HumanEval multi-agent benchmark",
    "GPT-6 Luna",
    "Claude Sonnet",
    "software factory",
    "Gaia Research",
  ],
  alternates: { canonical: articlePath },
  openGraph: {
    type: "article",
    url: articlePath,
    title: articleTitle,
    description: articleDescription,
    publishedTime: "2026-10-22T00:00:00+08:00",
    authors: [novaAuthor.display_name, novaAuthor.editorial.human_editorial_reviewer.name],
    images: [
      {
        url: cheapestAgentNotCheapestOutcomeThumbnail.src.src,
        width: 1600,
        height: 900,
        alt: cheapestAgentNotCheapestOutcomeThumbnail.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
    images: [cheapestAgentNotCheapestOutcomeThumbnail.src.src],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: articleTitle,
  description: articleDescription,
  image: thumbnailUrl,
  url: articleUrl,
  datePublished: "2026-10-22T00:00:00+08:00",
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
  // Strip H1 title & byline. The header below renders them.
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData).replace(/</g, "\\u003c") }}
        />
        <header className="blog-post-head">
          <p className="blog-post-meta">
            <time dateTime="2026-10-22">October 22, 2026</time> ·{" "}
            <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">
              {novaAuthor.display_name}
            </a>{" "}
            · Head Researcher, Gaia Research · Editorial review by{" "}
            {novaAuthor.editorial.human_editorial_reviewer.name}, Founder
          </p>
          <h1>{articleTitle}</h1>
          <p className="blog-post-subtitle">{articleSubtitle}</p>
          <p className="blog-post-summary">
            The cheapest route is not the cheapest route, once you count the attempts it takes to finish.
          </p>
        </header>

        <figure className="blog-post-illustration">
          <img
            src={cheapestAgentNotCheapestOutcomeThumbnail.src.src}
            width={cheapestAgentNotCheapestOutcomeThumbnail.src.width}
            height={cheapestAgentNotCheapestOutcomeThumbnail.src.height}
            alt={cheapestAgentNotCheapestOutcomeThumbnail.alt}
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

                if (text === "[[FIG_STUDY_COMPARISON]]") {
                  return <StudyComparisonFigure />;
                }
                if (text === "[[FIG_CAPABILITY_FLOOR]]") {
                  return <CapabilityFloorFigure />;
                }

                return <p {...props}>{children}</p>;
              },
              table: ({ children }) => (
                <div className="table-scroll-container">
                  <table className="report-table">{children}</table>
                </div>
              ),
            }}
          >
            {body}
          </Markdown>
        </article>

        <footer className="blog-post-foot">
          <Link href="/research/agent-role-intelligence">
            Read the full research report <span aria-hidden="true">→</span>
          </Link>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}

function StudyComparisonFigure() {
  return (
    <figure className="blog-post-figure" style={{ maxWidth: "560px", margin: "32px auto" }}>
      <svg
        viewBox="0 0 600 450"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="sc-title sc-desc"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title id="sc-title">Pass rate and API calls per task, five configurations</title>
        <desc id="sc-desc">
          Horizontal bar chart over 164 HumanEval tasks. Always routing to the largest model
          passes 81.7 percent using 3.00 API calls per task. One model in every role passes 72.6
          percent. Tiered routing with the weakest tier removed passes 72.0 percent. A single
          agent passes 67.7 percent. Tiered routing with the cheapest model first passes 62.2
          percent and uses 4.85 API calls per task, the most of any arm.
        </desc>

        <rect width="600" height="450" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

        <text x="24" y="36" fill="#f8fafc" fontSize="21" fontWeight="700" fontFamily="var(--font-mono)">
          Pass rate per configuration
        </text>
        <text x="24" y="58" fill="#94a3b8" fontSize="13" fontFamily="var(--font-mono)">
          164 HumanEval tasks, same task set for every arm
        </text>

        {[
          { label: "Always largest", pct: 81.7, pctText: "81.7%", note: "3.00 API calls per task", color: "#38bdf8", y: 76 },
          { label: "One model, all roles", pct: 72.6, pctText: "72.6%", note: "10.95 s per task", color: "#a78bfa", y: 124 },
          { label: "Tiered, no weak tier", pct: 72.0, pctText: "72.0%", note: "13.32 s per task", color: "#34d399", y: 172 },
          { label: "Single agent", pct: 67.7, pctText: "67.7%", note: "111 of 164 tasks", color: "#94a3b8", y: 220 },
          { label: "Tiered, cheap first", pct: 62.2, pctText: "62.2%", note: "4.85 API calls per task", color: "#ef4444", y: 268 },
        ].map((row) => {
          const w = (row.pct / 100) * 350;
          return (
            <g key={row.label}>
              <text x="16" y={row.y + 19} fill="#e2e8f0" fontSize="13" fontFamily="var(--font-mono)">
                {row.label}
              </text>
              <rect x="190" y={row.y} width="350" height="26" rx="4" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
              <rect x="190" y={row.y} width={w} height="26" rx="4" fill={row.color} opacity="0.88" />
              <text x={198 + w} y={row.y + 19} fill="#f8fafc" fontSize="16" fontWeight="700" fontFamily="var(--font-mono)">
                {row.pctText}
              </text>
              <text x="194" y={row.y + 42} fill="#64748b" fontSize="13" fontFamily="var(--font-mono)">
                {row.note}
              </text>
            </g>
          );
        })}

        <text x="24" y="336" fill="#e2e8f0" fontSize="16" fontWeight="700" fontFamily="var(--font-mono)">
          Tiered-cheap against always-largest, same task set:
        </text>
        <text x="24" y="356" fill="#94a3b8" fontSize="14" fontFamily="var(--font-mono)">
          19.5 points lower, 1.85 more calls, 4.62 more seconds per task
        </text>
        <text x="24" y="376" fill="#94a3b8" fontSize="14" fontFamily="var(--font-mono)">
          Removing only the weakest tier recovered 9.8 points
        </text>
        <text x="24" y="396" fill="#94a3b8" fontSize="14" fontFamily="var(--font-mono)">
          and cut escalations from 152 to 74
        </text>

        <text x="24" y="420" fill="#64748b" fontSize="13" fontFamily="var(--font-mono)">
          Measured: 164 HumanEval tasks, open-weight 1.5B to 32B models
        </text>
        <text x="24" y="438" fill="#64748b" fontSize="13" fontFamily="var(--font-mono)">
          The study reports seconds and API calls, not tokens or dollars
        </text>
      </svg>
    </figure>
  );
}

function CapabilityFloorFigure() {
  return (
    <figure className="blog-post-figure" style={{ maxWidth: "560px", margin: "32px auto" }}>
      <svg
        viewBox="0 0 600 450"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="cf-title cf-desc"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title id="cf-title">The capability-floor decision surface</title>
        <desc id="cf-desc">
          A two-stage routing decision. Stage one asks whether a candidate route clears the
          capability floor for the role and task class. Routes that fail are not ranked by price at
          all; they are removed, and the work they generate is escalated to a route that does clear
          the floor. Only routes that clear the floor are ranked by cost per accepted result.
        </desc>

        <rect width="600" height="450" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

        <text x="30" y="42" fill="#f8fafc" fontSize="21" fontWeight="700" fontFamily="var(--font-mono)">
          1. Eligibility gate
        </text>
        <text x="30" y="64" fill="#94a3b8" fontSize="13" fontFamily="var(--font-mono)">
          Does the route clear the floor for this role and task class?
        </text>

        <rect x="30" y="82" width="540" height="46" rx="8" fill="#0b1220" stroke="#334155" strokeWidth="1.5" />
        <text x="46" y="111" fill="#e2e8f0" fontSize="16" fontFamily="var(--font-mono)">
          candidate route (provider / model / effort)
        </text>

        <path d="M300 128 L300 156" stroke="#64748b" strokeWidth="2" />
        <path d="M290 148 L300 158 L310 148" fill="none" stroke="#64748b" strokeWidth="2" />

        <rect x="30" y="164" width="250" height="52" rx="8" fill="#0b1220" stroke="#ef4444" strokeWidth="1.5" />
        <text x="46" y="186" fill="#fca5a5" fontSize="16" fontWeight="700" fontFamily="var(--font-mono)">
          below the floor
        </text>
        <text x="46" y="205" fill="#94a3b8" fontSize="13" fontFamily="var(--font-mono)">
          not priced; removed
        </text>

        <rect x="270" y="164" width="300" height="52" rx="8" fill="#0b1220" stroke="#22c55e" strokeWidth="1.5" />
        <text x="286" y="186" fill="#86efac" fontSize="16" fontWeight="700" fontFamily="var(--font-mono)">
          clears the floor
        </text>
        <text x="286" y="205" fill="#94a3b8" fontSize="13" fontFamily="var(--font-mono)">
          eligible for ranking
        </text>

        <path d="M140 216 L140 236" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="5 4" />

        <rect x="30" y="238" width="370" height="62" rx="8" fill="#140b0b" stroke="#7f1d1d" strokeWidth="1.5" />
        <text x="46" y="256" fill="#fca5a5" fontSize="13" fontFamily="var(--font-mono)">
          a below-floor route does not accept
        </text>
        <text x="46" y="273" fill="#94a3b8" fontSize="13" fontFamily="var(--font-mono)">
          the task, it escalates, so the
        </text>
        <text x="46" y="290" fill="#94a3b8" fontSize="13" fontFamily="var(--font-mono)">
          expensive tier is billed anyway
        </text>

        <path d="M420 216 L420 336" fill="none" stroke="#22c55e" strokeWidth="2" />
        <path d="M410 328 L420 338 L430 328" fill="none" stroke="#22c55e" strokeWidth="2" />

        <text x="30" y="334" fill="#f8fafc" fontSize="21" fontWeight="700" fontFamily="var(--font-mono)">
          2. Cost ranking
        </text>
        <rect x="30" y="350" width="540" height="50" rx="8" fill="#0b1220" stroke="#38bdf8" strokeWidth="1.5" />
        <text x="46" y="372" fill="#e2e8f0" fontSize="16" fontFamily="var(--font-mono)">
          rank eligible routes by cost per accepted result
        </text>
        <text x="46" y="391" fill="#94a3b8" fontSize="13" fontFamily="var(--font-mono)">
          execution + retries + reviews + remediation, over accepted tasks
        </text>

        <text x="300" y="428" textAnchor="middle" fill="#64748b" fontSize="13" fontFamily="var(--font-mono)">
          Illustrative · not measured data
        </text>
      </svg>
    </figure>
  );
}
