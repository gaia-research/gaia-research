import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import PostShareBar from "@/components/PostShareBar";
import novaAuthor from "@/content/authors/nova.json";
import { capabilityAmplificationThumbnail } from "@/data/blog";
import postMd from "@/content/blog/capability-amplification/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/capability-amplification";
const articleUrl = `${siteUrl}${articlePath}`;
const thumbnailUrl = `${siteUrl}${capabilityAmplificationThumbnail.src.src}`;
const articleTitle = "Capability Amplification: When Better Scaffolding Beats a Bigger Model";
const articleDescription =
  "Structured agent scaffolding can buy task-level reliability more cheaply than buying a larger model. Why procedural skills are an economic instrument rather than prompt debt.";
const publishedTime = "2026-10-05T00:00:00+08:00";

export const metadata = {
  title: articleTitle,
  description: articleDescription,
  keywords: ["capability amplification", "agent scaffolding", "procedural skills", "token economics", "Gaia Research"],
  alternates: { canonical: articlePath },
  openGraph: {
    type: "article",
    url: articlePath,
    title: articleTitle,
    description: articleDescription,
    publishedTime,
    authors: [novaAuthor.display_name],
    images: [{ url: capabilityAmplificationThumbnail.src.src, width: 1600, height: 900, alt: capabilityAmplificationThumbnail.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
    images: [capabilityAmplificationThumbnail.src.src],
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
  author: { "@type": "Person", name: novaAuthor.display_name, url: novaAuthor.links.github },
  publisher: { "@type": "Organization", name: "Gaia Research", url: siteUrl },
};

function loadPost() {
  // Strip the title and byline; the header below renders them.
  return postMd.split("\n").slice(4).join("\n").trim();
}

const figureStyle = { width: "100%", maxWidth: 560, margin: "2rem auto" };
const svgStyle = { display: "block", width: "100%", height: "auto" };

function SvgScaffoldingTaxonomy() {
  const buckets = [
    { name: "Governance-critical", color: "#ec4899", role: "Protect authority and irreversible actions.", scale: "Stronger model? No: intelligence is not authority.", rule: "KEEP human approvals and hard boundaries." },
    { name: "Reliability-critical", color: "#38bdf8", role: "Encode task invariants and required ordering.", scale: "Stronger model? Not if the task still needs it.", rule: "KEEP checks that make execution correct." },
    { name: "Cost-amplifying", color: "#fbbf24", role: "Help a cheaper worker finish reliably.", scale: "Stronger model? Maybe, but compare total cost.", rule: "MEASURE cost per verified completion." },
    { name: "Legacy ceremony", color: "#cbd5e1", role: "Add process without useful protection or lift.", scale: "Stronger model? Neither model benefits.", rule: "DELETE when it buys none of the above." },
  ];
  return (
    <figure style={figureStyle}>
      <svg viewBox="0 0 600 450" style={svgStyle} role="img" aria-labelledby="scaffold-title scaffold-desc" fontFamily="Arial, sans-serif" fontSize={18}>
        <title id="scaffold-title">The Four Scaffolding Buckets</title>
        <desc id="scaffold-desc">Governance protects authority; reliability encodes task invariants; cost-amplifying structure helps cheaper workers; legacy ceremony adds no benefit. Stronger models do not remove authorization or task requirements. Measure economic scaffolds and delete useless ceremony.</desc>
        <rect width="600" height="450" rx="12" fill="#0c1222" stroke="#334155" />
        <text x="24" y="36" fill="#f8fafc" fontSize={25} fontWeight="bold">The Four Scaffolding Buckets</text>
        <text x="24" y="62" fill="#cbd5e1">Role → model-scale test → decision</text>
        {buckets.map((bucket, index) => (
          <g key={bucket.name} transform={`translate(24 ${88 + index * 90})`}>
            {index > 0 ? <line x1="0" x2="552" y1="-24" y2="-24" stroke="#334155" /> : null}
            <text fill={bucket.color} fontSize={21} fontWeight="bold">{bucket.name}</text>
            <text y="23" fill="#f8fafc">{bucket.role}</text>
            <text y="42" fill="#cbd5e1">{bucket.scale}</text>
            <text y="60" fill={bucket.color}>{bucket.rule}</text>
          </g>
        ))}
      </svg>
      <figcaption>Figure 1. Classify a scaffold by what it buys, not by its length. Authority and task invariants survive model upgrades; economic scaffolds must earn their total cost.</figcaption>
    </figure>
  );
}

function SvgCapabilityRoutingTradeoff() {
  return (
    <figure style={figureStyle}>
      <svg viewBox="0 0 600 450" style={svgStyle} role="img" aria-labelledby="routing-title routing-desc" fontFamily="Arial, sans-serif" fontSize={18}>
        <title id="routing-title">Inference Cost vs Task Reliability: What the Literature Measures</title>
        <desc id="routing-desc">Three separate evaluations, not a shared cost-quality frontier. AgentRouter reports 72 percent cost reduction and 97.3 percent retained frontier-only quality. Sub-Goal Distillation reports a 16.7 percentage-point ScienceWorld improvement over action-only imitation learning. METR classifies 51 percent of reviewed consequential GPT-4o mistakes as spurious, not true capability limits.</desc>
        <rect width="600" height="450" rx="12" fill="#0c1222" stroke="#334155" />
        <text x="24" y="35" fill="#f8fafc" fontSize={24} fontWeight="bold">Inference Cost vs Task Reliability</text>
        <text x="24" y="62" fill="#cbd5e1">What the literature measures</text>
        <line x1="24" x2="576" y1="80" y2="80" stroke="#334155" />
        <g transform="translate(24 110)">
          <text fill="#ec4899" fontSize={21} fontWeight="bold">AgentRouter · heterogeneous routing</text>
          <text y="34" fill="#f8fafc" fontSize={27} fontWeight="bold">72% cost cut / 97.3% quality retained</text>
          <text y="60" fill="#cbd5e1">Relative to frontier-only execution on its benchmark.</text>
        </g>
        <line x1="24" x2="576" y1="190" y2="190" stroke="#334155" />
        <g transform="translate(24 220)">
          <text fill="#fbbf24" fontSize={21} fontWeight="bold">Sub-Goal Distillation · planning structure</text>
          <text y="34" fill="#f8fafc" fontSize={29} fontWeight="bold">+16.7 percentage points</text>
          <text y="60" fill="#cbd5e1">ScienceWorld vs action-only imitation learning.</text>
        </g>
        <line x1="24" x2="576" y1="300" y2="300" stroke="#334155" />
        <g transform="translate(24 330)">
          <text fill="#38bdf8" fontSize={21} fontWeight="bold">METR · GPT-4o autonomy evaluation</text>
          <text y="34" fill="#f8fafc" fontSize={29} fontWeight="bold">51% spurious mistakes</text>
          <text y="60" fill="#cbd5e1">Share of consequential mistakes reviewed, not tasks.</text>
        </g>
        <text x="24" y="429" fill="#cbd5e1" fontSize={17}>Separate evaluations. No shared leaderboard or cost curve.</text>
      </svg>
      <figcaption>Figure 2. External literature findings, not Gaia benchmark results. Routing measures cost and retained quality; distillation measures performance lift; METR diagnoses mistakes. These quantities cannot be plotted as one comparable frontier.</figcaption>
    </figure>
  );
}

export default function CapabilityAmplificationPage() {
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
            <time dateTime="2026-10-05">October 5, 2026</time> ·{" "}
            <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">
              {novaAuthor.display_name}
            </a>{" "}
            · Head Researcher, Gaia Research
          </p>
          <h1>{articleTitle}</h1>
          <p className="blog-post-summary">{articleDescription}</p>
        </header>

        <figure className="blog-post-illustration">
          <img
            src={capabilityAmplificationThumbnail.src.src}
            width={capabilityAmplificationThumbnail.src.width}
            height={capabilityAmplificationThumbnail.src.height}
            alt={capabilityAmplificationThumbnail.alt}
          />
        </figure>

        <article className="blog-post-body report-body">
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              p({ children, ...props }) {
                if (children === "[[SCAFFOLDING_TAXONOMY]]") return <SvgScaffoldingTaxonomy />;
                if (children === "[[CAPABILITY_ROUTING_TRADE_OFF]]") return <SvgCapabilityRoutingTradeoff />;
                return <p {...props}>{children}</p>;
              },
            }}
          >
            {loadPost()}
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
