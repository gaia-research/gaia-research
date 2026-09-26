import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import PostShareBar from "@/components/PostShareBar";
import novaAuthor from "@/content/authors/nova.json";
import { reflexAgentsClassifiersThumbnail } from "@/data/blog";
import postMd from "@/content/blog/reflex-agents-and-classifiers/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/reflex-agents-and-classifiers";
const articleUrl = `${siteUrl}${articlePath}`;
const thumbnailUrl = `${siteUrl}${reflexAgentsClassifiersThumbnail.src.src}`;
const articleTitle = "The Return of the Simple Reflex Agent: Why Jev Is a Classifier, and Why That Matters";
const articleDescription =
  "Jev makes fast typed decisions instead of generating prose. Its useful return to reflex agents and probabilistic classification puts frontier LLM calls and local classifiers on the same audit list.";
const publishedTime = "2026-09-26T00:00:00+08:00";

export const metadata = {
  title: articleTitle,
  description: articleDescription,
  keywords: ["Jev", "TypeSafe AI", "simple reflex agent", "probabilistic classifier", "System One model", "Gaia Research"],
  alternates: { canonical: articlePath },
  openGraph: {
    type: "article",
    url: articlePath,
    title: articleTitle,
    description: articleDescription,
    publishedTime,
    authors: [novaAuthor.display_name],
    images: [{ url: reflexAgentsClassifiersThumbnail.src.src, width: 1600, height: 900, alt: reflexAgentsClassifiersThumbnail.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
    images: [reflexAgentsClassifiersThumbnail.src.src],
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

function SvgReflexArchitecture() {
  return (
    <figure className="blog-post-figure" style={{ margin: "32px 0" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        <svg viewBox="0 0 600 450" role="img" aria-labelledby="reflex-title reflex-desc" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto", display: "block" }}>
          <title id="reflex-title">Autoregressive LLM vs. Simple Reflex Classifier</title>
          <desc id="reflex-desc">A frontier model generates and parses text before a branch; a classifier scores fixed options and branches directly. This is an architectural comparison, not a measured timing result.</desc>
          <rect width="600" height="450" rx="16" fill="#0c1222" stroke="#334155" />
          <text x="300" y="38" textAnchor="middle" fill="#f8fafc" fontSize="21" fontWeight="700">Two ways to decide</text>
          <text x="300" y="62" textAnchor="middle" fill="#94a3b8" fontSize="14">Same input: should this ticket be escalated?</text>
          <rect x="24" y="86" width="552" height="140" rx="12" fill="#281525" stroke="#ec4899" />
          <text x="42" y="112" fill="#f9a8d4" fontSize="18" fontWeight="700">Autoregressive LLM</text>
          <text x="42" y="140" fill="#e2e8f0" fontSize="15">Prompt + context → generate answer tokens</text>
          <text x="42" y="165" fill="#e2e8f0" fontSize="15">→ parse JSON → validate → branch</text>
          <text x="42" y="201" fill="#f9a8d4" fontSize="14">Open-ended text output, even for a binary decision</text>
          <rect x="24" y="242" width="552" height="140" rx="12" fill="#102336" stroke="#38bdf8" />
          <text x="42" y="268" fill="#7dd3fc" fontSize="18" fontWeight="700">Simple reflex classifier</text>
          <text x="42" y="296" fill="#e2e8f0" fontSize="15">Percept + fixed options → score candidates</text>
          <text x="42" y="321" fill="#e2e8f0" fontSize="15">→ choose an action → branch</text>
          <text x="42" y="357" fill="#7dd3fc" fontSize="14">Bounded decision; state can live in surrounding code</text>
          <text x="300" y="423" textAnchor="middle" fill="#94a3b8" fontSize="13">Architecture analogy · Russell &amp; Norvig, ch. 2 · not timing data</text>
        </svg>
      </div>
      <figcaption>Figure 1: The branch does not need prose. Jev offers a typed decision interface; this diagram does not assert how Jev implements its model internally.</figcaption>
    </figure>
  );
}

function SvgBenchmarkComparison() {
  return (
    <figure className="blog-post-figure" style={{ margin: "32px 0" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        <svg viewBox="0 0 600 450" role="img" aria-labelledby="bench-title bench-desc" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto", display: "block" }}>
          <title id="bench-title">Accuracy vs. Latency / Cost tradeoff: Custom Classifier vs Jev vs Claude Fable 5.1</title>
          <desc id="bench-desc">On Janardhan's 200-item benchmark Jev scored 72.5 percent and Claude Fable 5.1 scored 84 percent. A custom classifier's accuracy is task dependent and not plotted on this benchmark. Latency and cost below are separate deployment characteristics, not measurements from that benchmark.</desc>
          <rect width="600" height="450" rx="16" fill="#0c1222" stroke="#334155" />
          <text x="300" y="36" textAnchor="middle" fill="#f8fafc" fontSize="21" fontWeight="700">Accuracy is not the only axis</text>
          <text x="28" y="68" fill="#cbd5e1" fontSize="15">Janardhan: 200 items, same six-model test</text>
          <text x="28" y="101" fill="#f9a8d4" fontSize="16">Fable 5.1</text>
          <rect x="185" y="83" width="336" height="24" rx="4" fill="#ec4899" />
          <text x="532" y="101" fill="#f8fafc" fontSize="16">84.0%</text>
          <text x="28" y="143" fill="#7dd3fc" fontSize="16">Jev</text>
          <rect x="185" y="125" width="290" height="24" rx="4" fill="#38bdf8" />
          <text x="486" y="143" fill="#f8fafc" fontSize="16">72.5%</text>
          <text x="28" y="181" fill="#86efac" fontSize="16">Custom</text>
          <text x="185" y="181" fill="#cbd5e1" fontSize="14">Not tested on these items</text>
          <line x1="28" y1="204" x2="572" y2="204" stroke="#334155" />
          <text x="28" y="234" fill="#cbd5e1" fontSize="16" fontWeight="700">Deployment tradeoff (different evidence)</text>
          <text x="28" y="270" fill="#86efac" fontSize="16">Custom</text>
          <text x="185" y="270" fill="#e2e8f0" fontSize="14">Local, no per-query fee; train on labels</text>
          <text x="28" y="307" fill="#7dd3fc" fontSize="16">Jev</text>
          <text x="185" y="307" fill="#e2e8f0" fontSize="14">70–500 ms; $0.042/M input</text>
          <text x="28" y="344" fill="#f9a8d4" fontSize="16">Frontier</text>
          <text x="185" y="344" fill="#e2e8f0" fontSize="14">More flexible; model-specific cost</text>
          <text x="300" y="396" textAnchor="middle" fill="#94a3b8" fontSize="13">Accuracy: Janardhan · speed/price: TypeSafe claim</text>
          <text x="300" y="416" textAnchor="middle" fill="#94a3b8" fontSize="13">Local row: architecture, not a measured benchmark</text>
        </svg>
      </div>
      <figcaption>Figure 2: Accuracy comes from one small shared test. Speed and price come from TypeSafe's published claims; local economics depend on deployment. Do not compare the custom model's task-specific score directly with Janardhan's test.</figcaption>
    </figure>
  );
}

function YoutubeEmbed() {
  return (
    <figure className="blog-video" style={{ margin: "20px 0" }}>
      <iframe
        src="https://www.youtube-nocookie.com/embed/0zFfcEr1e9U"
        title="Jev by TypeSafe AI | What is a System-1 Decision Model | CampusX"
        width="960"
        height="540"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ width: "100%", aspectRatio: "16 / 9", height: "auto" }}
      />
      <figcaption>CampusX explainer (third-party commentary, not an official TypeSafe video).</figcaption>
    </figure>
  );
}

function loadPost() {
  return postMd.split("\n").slice(4).join("\n").trim();
}

export default function ReflexAgentsClassifiersPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="blog-post-page">
        <PostShareBar />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData).replace(/</g, "\\u003c") }} />
        <header className="blog-post-head">
          <p className="blog-post-meta">
            <time dateTime="2026-09-26">September 26, 2026</time> ·{" "}
            <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">{novaAuthor.display_name}</a>{" "}
            · Head Researcher, Gaia Research
          </p>
          <h1>{articleTitle}</h1>
          <p className="blog-post-summary">A fast typed decision is a welcome alternative to asking a frontier model to write a boolean. A trained local classifier may be better still.</p>
        </header>
        <figure className="blog-post-illustration">
          <img src={reflexAgentsClassifiersThumbnail.src.src} width={reflexAgentsClassifiersThumbnail.src.width} height={reflexAgentsClassifiersThumbnail.src.height} alt={reflexAgentsClassifiersThumbnail.alt} />
        </figure>
        <article className="blog-post-body report-body">
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              p: ({ children, ...props }) => {
                const childArray = Array.isArray(children) ? children : [children];
                const text = childArray.length === 1 && typeof childArray[0] === "string" ? childArray[0] : null;
                if (text === "[[SVG_REFLEX_ARCHITECTURE]]") return <SvgReflexArchitecture />;
                if (text === "[[SVG_BENCHMARK_COMPARISON]]") return <SvgBenchmarkComparison />;
                if (text === "[[YOUTUBE_EMBED]]") return <YoutubeEmbed />;
                return <p {...props}>{children}</p>;
              },
            }}
          >
            {loadPost()}
          </Markdown>
        </article>
        <footer className="blog-post-foot"><Link href="/blog">Back to Blog <span aria-hidden="true">→</span></Link></footer>
      </main>
      <SiteFooter />
    </>
  );
}
