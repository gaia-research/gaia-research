import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import PostShareBar from "@/components/PostShareBar";
import marcusAuthor from "@/content/authors/marcus.json";
import postMd from "@/content/blog/context-ablation/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/context-ablation";
const articleUrl = `${siteUrl}${articlePath}`;
const articleTitle = "Context Ablation: Press Delete Without Losing the Experiment";
const articleDescription =
  "Context ablation is a controlled way to test whether an agent still needs a context block: checkpoint the original, remove one unit, run paired evaluations, and accept only an exact reversible candidate.";

export const metadata = {
  title: articleTitle,
  description: articleDescription,
  keywords: [
    "context ablation",
    "context engineering",
    "Claude Code",
    "agent context",
    "CLAUDE.md",
    "Context Diet",
    "AI evaluation",
  ],
  alternates: { canonical: articlePath },
  openGraph: {
    type: "article",
    url: articlePath,
    title: articleTitle,
    description: articleDescription,
    publishedTime: "2026-08-07T00:00:00+08:00",
    authors: [marcusAuthor.display_name],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: articleTitle,
  description: articleDescription,
  url: articleUrl,
  datePublished: "2026-08-07T00:00:00+08:00",
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
  // Strip H1 title & subtitle since the page header renders them.
  return postMd.split("\n").slice(4).join("\n").trim();
}

function AblationLoopFigure() {
  const top = [
    { x: 20, label: "CHECKPOINT", sub: "exact bytes" },
    { x: 204, label: "INVENTORY", sub: "protect units" },
    { x: 388, label: "BASELINE", sub: "fresh routes" },
    { x: 572, label: "STAGE", sub: "live file stays" },
  ];
  const bottom = [
    { x: 112, label: "PAIRED EVAL", sub: "same cases" },
    { x: 296, label: "REVIEW", sub: "pass / fail /" },
    { x: 480, label: "ACCEPT", sub: "trial + SHA" },
  ];

  return (
    <figure className="blog-figure blog-figure-chart">
      <figcaption>Context ablation keeps mutation behind an evidence gate</figcaption>
      <svg viewBox="0 0 760 380" role="img" aria-labelledby="ablation-loop-title ablation-loop-desc">
        <title id="ablation-loop-title">Reversible context ablation loop</title>
        <desc id="ablation-loop-desc">
          A flow from exact checkpoint to protected inventory, fresh baselines, and a staged candidate.
          The candidate goes through paired evaluation and review before hash-authorized acceptance or rollback.
        </desc>

        {top.map((step, index) => (
          <g key={step.label}>
            <rect x={step.x} y="42" width="168" height="72" rx="10" fill="#111827" stroke={index === 3 ? "#ec4899" : "#334155"} />
            <text x={step.x + 16} y="70" fill={index === 3 ? "#ec4899" : "#38bdf8"} fontSize="12" fontFamily="monospace" fontWeight="700">{step.label}</text>
            <text x={step.x + 16} y="94" fill="#cbd5e1" fontSize="14">{step.sub}</text>
            {index < top.length - 1 && (
              <path d={`M ${step.x + 174} 78 H ${step.x + 184}`} stroke="#64748b" strokeWidth="2" />
            )}
          </g>
        ))}

        <path d="M 656 122 V 164 H 196 V 194" fill="none" stroke="#ec4899" strokeWidth="2" strokeDasharray="5 4" />
        <text x="664" y="151" fill="#ec4899" fontSize="11" fontFamily="monospace">candidate only</text>

        {bottom.map((step, index) => (
          <g key={step.label}>
            <rect x={step.x} y="194" width="168" height="72" rx="10" fill="#111827" stroke={index === 2 ? "#ec4899" : "#334155"} />
            <text x={step.x + 16} y="222" fill={index === 2 ? "#ec4899" : "#38bdf8"} fontSize="12" fontFamily="monospace" fontWeight="700">{step.label}</text>
            <text x={step.x + 16} y="246" fill="#cbd5e1" fontSize="14">{step.sub}</text>
            {index < bottom.length - 1 && (
              <path d={`M ${step.x + 174} 230 H ${step.x + 184}`} stroke="#64748b" strokeWidth="2" />
            )}
          </g>
        ))}

        <path d="M 564 274 V 310 H 200 V 328" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 4" />
        <text x="572" y="300" fill="#f59e0b" fontSize="11" fontFamily="monospace">reject / rollback</text>
        <rect x="112" y="328" width="176" height="34" rx="8" fill="rgba(245,158,11,.08)" stroke="#f59e0b" />
        <text x="200" y="350" fill="#fbbf24" fontSize="12" fontFamily="monospace" textAnchor="middle">RESTORE REVISION</text>
        <text x="510" y="350" fill="#94a3b8" fontSize="12" fontStyle="italic" textAnchor="middle">the live file changes last</text>
      </svg>
      <p className="blog-svg-note">One unit by default. Higher concurrency is an explicit trade-off: faster trials, weaker attribution.</p>
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData).replace(/</g, "\\u003c") }}
        />
        <header className="blog-post-head">
          <p className="blog-post-meta">
            <time dateTime="2026-08-07">August 7, 2026</time> · {" "}
            <a href={marcusAuthor.links.github} target="_blank" rel="noreferrer">
              {marcusAuthor.display_name}
            </a>{" "}· Founder, Gaia Research
          </p>
          <h1>{articleTitle}</h1>
          <p className="blog-post-summary">A deletion is not an experiment until the original, the test, and the decision are all reviewable.</p>
        </header>

        <article className="blog-post-body report-body">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children, ...props }) => {
                const text = props.node?.children
                  .map((child) => child.type === "text" ? child.value : "")
                  .join("")
                  ?? (Array.isArray(children) ? children.join("") : typeof children === "string" ? children : "");
                if (text === "[[ABLATION_LOOP]]") {
                  return <AblationLoopFigure />;
                }
                if (text === "[[YOUTUBE_EMBED]]") {
                  return (
                    <figure className="blog-video">
                      <iframe
                        src="https://www.youtube-nocookie.com/embed/qyPCVqFUyDo?start=361"
                        title="Boris Cherny: We Cut 80% of Claude Code's Prompt — ablation at 06:01"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      <figcaption>Source talk by Boris Cherny, Y Combinator. The player starts at 06:01.</figcaption>
                    </figure>
                  );
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
