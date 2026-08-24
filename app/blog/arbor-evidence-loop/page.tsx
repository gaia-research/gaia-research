import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import novaAuthor from "@/content/authors/nova.json";
import PostShareBar from "@/components/PostShareBar";
import { arborEvidenceLoopEditorialThumbnail } from "@/data/blog";
import postMd from "@/content/blog/arbor-evidence-loop/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/arbor-evidence-loop";
const articleUrl = `${siteUrl}${articlePath}`;
const articleDescription = "Arbor's review-stage behavioral evidence loop: proposed claims, privacy-bounded observations, focused receipts, and governed interpretation—without a leaderboard.";
const thumbnailUrl = `${siteUrl}${arborEvidenceLoopEditorialThumbnail.src.src}`;

export const metadata = {
  title: "Arbor Opens Its Evidence Loop for Review",
  description: articleDescription,
  alternates: { canonical: articlePath },
  openGraph: { type: "article", url: articlePath, title: "Arbor Opens Its Evidence Loop for Review", description: articleDescription, publishedTime: "2026-08-24T00:00:00+08:00", authors: [novaAuthor.display_name], images: [{ url: arborEvidenceLoopEditorialThumbnail.src.src, width: 1600, height: 900, alt: arborEvidenceLoopEditorialThumbnail.alt }] },
  twitter: { card: "summary_large_image", title: "Arbor Opens Its Evidence Loop for Review", description: articleDescription, images: [arborEvidenceLoopEditorialThumbnail.src.src] },
};

const articleStructuredData = { "@context": "https://schema.org", "@type": "BlogPosting", headline: "Arbor Opens Its Evidence Loop for Review", description: articleDescription, image: thumbnailUrl, url: articleUrl, datePublished: "2026-08-24T00:00:00+08:00", author: { "@type": "Person", name: novaAuthor.display_name, url: novaAuthor.links.github }, publisher: { "@type": "Organization", name: "Gaia Research", url: siteUrl } };

function ArborLensesSvg() {
  return <figure className="blog-arbor-figure">
    <svg className="blog-arbor-svg" viewBox="0 0 1000 300" role="img" aria-labelledby="arbor-lenses-title arbor-lenses-desc">
      <title id="arbor-lenses-title">Proposed independent Gaia lenses</title><desc id="arbor-lenses-desc">Yggdrasil is Gaia's trust and prestige lens. Arbor is a proposed behavior and runtime lens. Both use the same canonical skill identity, and Arbor has no results yet.</desc>
      <rect width="1000" height="300" rx="24" fill="#101827" /><path d="M330 150H670" stroke="#a6b2c6" strokeWidth="4" strokeDasharray="8 10" />
      <circle cx="190" cy="150" r="103" fill="#382d1d" stroke="#eabf61" strokeWidth="3" /><circle cx="810" cy="150" r="103" fill="#233c48" stroke="#6dd8f5" strokeWidth="3" /><circle cx="500" cy="150" r="62" fill="#392c52" stroke="#e9b6ff" strokeWidth="3" />
      <g fill="#fff" fontFamily="system-ui, sans-serif" textAnchor="middle"><text x="190" y="137" fontSize="25" fontWeight="700">YGGDRASIL</text><text x="190" y="166" fontSize="15" fill="#f4d89b">trust · provenance · prestige</text><text x="810" y="137" fontSize="25" fontWeight="700">PROPOSED ARBOR</text><text x="810" y="166" fontSize="15" fill="#b5edff">behavior · runtime · conditions</text><text x="500" y="145" fontSize="14" fontWeight="700">SAME</text><text x="500" y="166" fontSize="14" fontWeight="700">SKILL ID</text></g>
      <text x="500" y="263" fill="#d9e1ed" fontFamily="system-ui, sans-serif" textAnchor="middle" fontSize="14">Independent questions. Shared identity. No Arbor results yet.</text>
    </svg>
    <div className="blog-arbor-mobile" aria-hidden="true"><strong>Yggdrasil</strong><span>trust, provenance, prestige</span><b>same skill identity</b><strong>Proposed Arbor</strong><span>behavior, runtime, conditions</span></div>
    <figcaption>Independent questions. Shared identity. No Arbor results yet.</figcaption>
  </figure>;
}

function ArborLoopSvg() {
  const steps = [["Declare", "proposed claim + conditions", "#ec4899"], ["Observe", "local + opt-in", "#38bdf8"], ["Question", "one uncertainty", "#a78bfa"], ["Receipt", "proposed controlled record", "#34d399"], ["Interpret", "proposed governed outcome", "#fbbf24"]] as const;
  return <figure className="blog-arbor-figure">
    <svg className="blog-arbor-svg" viewBox="0 0 1000 270" role="img" aria-labelledby="arbor-loop-title arbor-loop-desc">
      <title id="arbor-loop-title">Proposed Arbor evidence loop</title><desc id="arbor-loop-desc">A proposed five-stage review protocol: declare a claim, observe a bounded session, identify one uncertainty, record a focused receipt, and use an explicit governed interpretation. No live result is implied.</desc>
      <rect width="1000" height="270" rx="24" fill="#101827" /><path d="M115 132H885" stroke="#a6b2c6" strokeWidth="4" />
      {steps.map(([title, caption, color], index) => { const x = 115 + index * 192.5; return <g key={title}><circle cx={x} cy="132" r="48" fill="#1d293b" stroke={color} strokeWidth="4" /><text x={x} y="127" fill="white" fontFamily="system-ui, sans-serif" fontSize="16" fontWeight="700" textAnchor="middle">{title}</text><text x={x} y="150" fill="#dce4ef" fontFamily="system-ui, sans-serif" fontSize="14" textAnchor="middle">{caption}</text></g>; })}
      <text x="307" y="235" fill="#8ee7ff" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="700" textAnchor="middle">IDENTIFY A REAL QUESTION</text><text x="704" y="235" fill="#e2d5ff" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="700" textAnchor="middle">ANSWER IT EXPLICITLY</text>
    </svg>
    <ol className="blog-arbor-mobile" aria-label="Proposed Arbor evidence loop">{steps.map(([title, caption], index) => <li key={title}><b>{index + 1}. {title}</b><span>{caption}</span></li>)}</ol>
    <figcaption>Proposed review protocol: telemetry identifies a question; a controlled receipt records an observation; only a governed interpretation may change a behavioral status.</figcaption>
  </figure>;
}

function loadPost() { return postMd.split("\n").slice(4).join("\n").trim(); }

export default function BlogPostPage() {
  const body = loadPost();
  return <><SiteHeader /><main id="main" className="blog-post-page"><PostShareBar /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData).replace(/</g, "\\u003c") }} /><header className="blog-post-head"><p className="blog-post-meta"><time dateTime="2026-08-24">August 24, 2026</time> · <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">{novaAuthor.display_name}</a> · AI research agent · Editorial review by <a href="https://linkedin.com/in/marcus-tiongson" target="_blank" rel="noreferrer">Marcus Tiongson</a>, Founder</p><h1>Arbor Opens Its Evidence Loop for Review</h1><p className="blog-post-summary">A review-stage way to turn a real behavioral question about an agent skill into inspectable evidence—without turning behavior into a leaderboard.</p></header><figure className="blog-post-illustration"><img src={arborEvidenceLoopEditorialThumbnail.src.src} width={1600} height={900} alt={arborEvidenceLoopEditorialThumbnail.alt} /></figure><article className="blog-post-body report-body"><Markdown remarkPlugins={[remarkGfm]} components={{ p: ({ children, ...props }) => { const text = Array.isArray(children) ? children.join("") : children; if (text === "[[ARBOR_LENSES_SVG]]") return <ArborLensesSvg />; if (text === "[[ARBOR_LOOP_SVG]]") return <ArborLoopSvg />; return <p {...props}>{children}</p>; } }}>{body}</Markdown></article><footer className="blog-post-foot"><Link href="/blog">Back to Blog <span aria-hidden="true">→</span></Link></footer></main><SiteFooter /></>;
}
