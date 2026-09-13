import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import novaAuthor from "@/content/authors/nova.json";
import PostShareBar from "@/components/PostShareBar";
import { contextCompactionPhase2Thumbnail } from "@/data/blog";
import postMd from "@/content/blog/context-compaction-phase-2/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/context-compaction-phase-2";
const articleUrl = `${siteUrl}${articlePath}`;
const thumbnailUrl = `${siteUrl}${contextCompactionPhase2Thumbnail.src.src}`;
const articleTitle =
  "We Ran 37 Agent Sessions to Find the Real Compaction Sweet Spot";
const articleDescription =
  "Phase 1 modelled the compaction sweet spot at 40k–65k. Then we measured it: 37 agent runs across 8 autocompaction ceilings on Gemini 3.8 Flash. Compacting at 50k costs more than never compacting at all.";

export const metadata = {
  title: articleTitle,
  description: articleDescription,
  keywords: [
    "context compaction",
    "empirical benchmark",
    "Pareto frontier",
    "prompt caching",
    "reasoning tokens",
    "reacquisition thrashing",
    "Gemini 3.8 Flash",
    "token economics",
    "Claude Code",
    "agent context management",
    "Gaia Research",
  ],
  alternates: { canonical: articlePath },
  openGraph: {
    type: "article",
    url: articlePath,
    title: articleTitle,
    description: articleDescription,
    publishedTime: "2026-09-13T00:00:00+08:00",
    authors: [novaAuthor.display_name],
    images: [
      {
        url: contextCompactionPhase2Thumbnail.src.src,
        width: 1600,
        height: 900,
        alt: contextCompactionPhase2Thumbnail.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
    images: [contextCompactionPhase2Thumbnail.src.src],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: articleTitle,
  description: articleDescription,
  image: thumbnailUrl,
  url: articleUrl,
  datePublished: "2026-09-13T00:00:00+08:00",
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

/* ─── SVG Figures ─── */

function CompactionCurveFigureSvg() {
  return (
    <figure className="blog-post-figure" style={{ margin: "32px 0" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        <svg
          viewBox="0 0 600 450"
          role="img"
          aria-labelledby="fig1-t fig1-d"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <title id="fig1-t">Total session cost by autocompaction ceiling</title>
          <desc id="fig1-d">Gemini 3.8 Flash · one run per arm · 30-turn warm sweep and 25-turn cold-gap sweep</desc>
          <rect width="600" height="450" rx="8" fill="#0c1222" stroke="#1e293b" />
          <text x="300" y="32" fill="#f8fafc" fontSize="21" fontWeight="600" textAnchor="middle">Total session cost by autocompaction ceiling</text>
          <text x="300" y="54" fill="#94a3b8" fontSize="13" textAnchor="middle">Gemini 3.8 Flash · one run per arm · 30-turn warm sweep and 25-turn cold-gap sweep</text>

          <line x1="92" y1="88" x2="92" y2="390" stroke="#334155" strokeDasharray="0" />
          <text x="92" y="408" fill="#64748b" fontSize="15" textAnchor="middle">$0</text>
          <line x1="222" y1="88" x2="222" y2="390" stroke="#1e293b" strokeDasharray="3 4" />
          <text x="222" y="408" fill="#64748b" fontSize="15" textAnchor="middle">$2</text>
          <line x1="353" y1="88" x2="353" y2="390" stroke="#1e293b" strokeDasharray="3 4" />
          <text x="353" y="408" fill="#64748b" fontSize="15" textAnchor="middle">$4</text>
          <line x1="483" y1="88" x2="483" y2="390" stroke="#1e293b" strokeDasharray="3 4" />
          <text x="483" y="408" fill="#64748b" fontSize="15" textAnchor="middle">$6</text>
          <text x="82" y="117" fill="#f8fafc" fontSize="19" fontWeight="600" textAnchor="end">50k</text>
          <rect x="92" y="98" width="292" height="15" fill="#38bdf8" fillOpacity="1.0" />
          <rect x="92" y="115" width="161" height="12" fill="#ec4899" fillOpacity="1.0" />
          <text x="82" y="154" fill="#94a3b8" fontSize="19" fontWeight="400" textAnchor="end">100k</text>
          <rect x="92" y="135" width="176" height="15" fill="#38bdf8" fillOpacity="0.7" />
          <rect x="92" y="152" width="151" height="12" fill="#ec4899" fillOpacity="0.7" />
          <text x="82" y="191" fill="#94a3b8" fontSize="19" fontWeight="400" textAnchor="end">150k</text>
          <rect x="92" y="172" width="221" height="15" fill="#38bdf8" fillOpacity="0.7" />
          <rect x="92" y="189" width="167" height="12" fill="#ec4899" fillOpacity="0.7" />
          <text x="82" y="228" fill="#94a3b8" fontSize="19" fontWeight="400" textAnchor="end">200k</text>
          <rect x="92" y="209" width="148" height="15" fill="#38bdf8" fillOpacity="0.7" />
          <rect x="92" y="226" width="236" height="12" fill="#ec4899" fillOpacity="0.7" />
          <text x="82" y="265" fill="#94a3b8" fontSize="19" fontWeight="400" textAnchor="end">272k</text>
          <rect x="92" y="246" width="204" height="15" fill="#38bdf8" fillOpacity="0.7" />
          <rect x="92" y="263" width="136" height="12" fill="#ec4899" fillOpacity="0.7" />
          <text x="82" y="302" fill="#94a3b8" fontSize="19" fontWeight="400" textAnchor="end">500k</text>
          <rect x="92" y="283" width="169" height="15" fill="#38bdf8" fillOpacity="0.7" />
          <rect x="92" y="300" width="110" height="12" fill="#ec4899" fillOpacity="0.7" />
          <text x="82" y="339" fill="#94a3b8" fontSize="19" fontWeight="400" textAnchor="end">1M</text>
          <rect x="92" y="320" width="242" height="15" fill="#38bdf8" fillOpacity="0.7" />
          <rect x="92" y="337" width="449" height="12" fill="#ec4899" fillOpacity="0.7" />
          <text x="82" y="376" fill="#94a3b8" fontSize="19" fontWeight="400" textAnchor="end">off</text>
          <rect x="92" y="357" width="165" height="15" fill="#38bdf8" fillOpacity="0.7" />
          <rect x="92" y="374" width="104" height="12" fill="#ec4899" fillOpacity="0.7" />

          <text x="300" y="430" fill="#94a3b8" fontSize="14" textAnchor="middle">Autocompaction ceiling · total billed session cost (USD)</text>
          <g transform="translate(150, 444)">
            <rect x="0" y="0" width="16" height="13" fill="#38bdf8" fillOpacity="0.85" />
            <text x="23" y="12" fill="#bae6fd" fontSize="14">Scenario 2 · warm</text>
            <rect x="165" y="0" width="16" height="13" fill="#ec4899" fillOpacity="0.85" />
            <text x="188" y="12" fill="#fbcfe8" fontSize="14">Scenario 4 · cold gaps</text>
          </g>
        </svg>
      </div>
      <figcaption style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "10px", textAlign: "center" }}>
        Figure 1: Total billed cost per arm, both sweeps. The 50k ceiling is worst or near-worst in
        both and is the only arm that thrashes (101 and 37 compactions). Above 150k the arms scatter
        within single-run noise — the penalty is at the low end, not the high end. Exact figures in
        the table above.
      </figcaption>
    </figure>
  );
}

function ReasoningScalingFigureSvg() {
  return (
    <figure className="blog-post-figure" style={{ margin: "32px 0" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        <svg
          viewBox="0 0 600 450"
          role="img"
          aria-labelledby="fig2-t fig2-d"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <title id="fig2-t">Reasoning tokens vs context length</title>
          <desc id="fig2-d">Scenario 3 · 12 runs, identical refactor task · log–log axes</desc>
          <rect width="600" height="450" rx="8" fill="#0c1222" stroke="#1e293b" />
          <text x="300" y="32" fill="#f8fafc" fontSize="21" fontWeight="600" textAnchor="middle">Reasoning tokens vs context length</text>
          <text x="300" y="54" fill="#94a3b8" fontSize="13" textAnchor="middle">Scenario 3 · 12 runs, identical refactor task · log–log axes</text>

          <line x1="96" y1="350" x2="556" y2="350" stroke="#1e293b" strokeDasharray="3 4" />
          <text x="86" y="355" fill="#64748b" fontSize="15" textAnchor="end">10</text>
          <line x1="96" y1="225" x2="556" y2="225" stroke="#1e293b" strokeDasharray="3 4" />
          <text x="86" y="230" fill="#64748b" fontSize="15" textAnchor="end">100</text>
          <line x1="96" y1="100" x2="556" y2="100" stroke="#1e293b" strokeDasharray="3 4" />
          <text x="86" y="105" fill="#64748b" fontSize="15" textAnchor="end">1,000</text>
          <line x1="96" y1="300" x2="556" y2="155" stroke="#f59e0b" strokeWidth="3" />
          <circle cx="249" cy="266" r="6" fill="#fbbf24" fillOpacity="0.9" stroke="#0c1222" strokeWidth="1.5" />
          <circle cx="145" cy="296" r="6" fill="#fbbf24" fillOpacity="0.9" stroke="#0c1222" strokeWidth="1.5" />
          <circle cx="303" cy="166" r="6" fill="#fbbf24" fillOpacity="0.9" stroke="#0c1222" strokeWidth="1.5" />
          <circle cx="217" cy="212" r="6" fill="#fbbf24" fillOpacity="0.9" stroke="#0c1222" strokeWidth="1.5" />
          <circle cx="124" cy="307" r="6" fill="#fbbf24" fillOpacity="0.9" stroke="#0c1222" strokeWidth="1.5" />
          <circle cx="223" cy="315" r="6" fill="#fbbf24" fillOpacity="0.9" stroke="#0c1222" strokeWidth="1.5" />
          <circle cx="382" cy="177" r="6" fill="#fbbf24" fillOpacity="0.9" stroke="#0c1222" strokeWidth="1.5" />
          <circle cx="412" cy="168" r="6" fill="#fbbf24" fillOpacity="0.9" stroke="#0c1222" strokeWidth="1.5" />
          <circle cx="409" cy="278" r="6" fill="#fbbf24" fillOpacity="0.9" stroke="#0c1222" strokeWidth="1.5" />
          <circle cx="514" cy="181" r="6" fill="#fbbf24" fillOpacity="0.9" stroke="#0c1222" strokeWidth="1.5" />
          <circle cx="371" cy="196" r="6" fill="#fbbf24" fillOpacity="0.9" stroke="#0c1222" strokeWidth="1.5" />
          <circle cx="476" cy="192" r="6" fill="#fbbf24" fillOpacity="0.9" stroke="#0c1222" strokeWidth="1.5" />
          <text x="96" y="374" fill="#94a3b8" fontSize="15" textAnchor="middle">50k</text>
          <text x="274" y="374" fill="#94a3b8" fontSize="15" textAnchor="middle">100k</text>
          <text x="452" y="374" fill="#94a3b8" fontSize="15" textAnchor="middle">200k</text>
          <text x="556" y="374" fill="#94a3b8" fontSize="15" textAnchor="middle">300k</text>

          <text x="326" y="398" fill="#94a3b8" fontSize="14" textAnchor="middle">Measured context length (L)</text>
          <text x="26" y="225" fill="#f59e0b" fontSize="14" fontWeight="600" transform="rotate(-90 26 225)" textAnchor="middle">Reasoning tokens (T)</text>
          <g transform="translate(150, 400)">
            <rect x="0" y="0" width="300" height="34" rx="5" fill="#0f172a" fillOpacity="0.9" stroke="#f59e0b" />
            <text x="150" y="15" fill="#fbbf24" fontSize="15" fontWeight="600" textAnchor="middle">Super-linear exponent β = 1.49</text>
            <text x="150" y="29" fill="#cbd5e1" fontSize="13" textAnchor="middle">2× the context → ≈2.8× the thinking</text>
          </g>
        </svg>
      </div>
      <figcaption style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "10px", textAlign: "center" }}>
        Figure 2: Every dot is one of the 12 measured Scenario 3 runs; the line is the fitted power
        law. Run-to-run spread is wide at fixed context length — the exponent describes the trend,
        not any single turn. Full per-run receipts are in the{" "}
        <Link href="/research/context-compaction-phase-2">Phase 2 Methodology &amp; Receipts Report</Link>.
      </figcaption>
    </figure>
  );
}

function ModelPricingFigureSvg() {
  return (
    <figure className="blog-post-figure" style={{ margin: "32px 0" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        <svg
          viewBox="0 0 600 450"
          role="img"
          aria-labelledby="fig3-t fig3-d"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <title id="fig3-t">The same build, priced on four frontier models</title>
          <desc id="fig3-d">25-turn feature build · compacting at 50k vs never compacting</desc>
          <rect width="600" height="450" rx="8" fill="#0c1222" stroke="#1e293b" />
          <text x="300" y="32" fill="#f8fafc" fontSize="21" fontWeight="600" textAnchor="middle">The same build, priced on four frontier models</text>
          <text x="300" y="54" fill="#94a3b8" fontSize="13" textAnchor="middle">25-turn feature build · compacting at 50k vs never compacting</text>

          <line x1="152" y1="90" x2="152" y2="362" stroke="#334155" strokeDasharray="0" />
          <text x="152" y="382" fill="#64748b" fontSize="15" textAnchor="middle">$0</text>
          <line x1="241" y1="90" x2="241" y2="362" stroke="#1e293b" strokeDasharray="3 4" />
          <text x="241" y="382" fill="#64748b" fontSize="15" textAnchor="middle">$10</text>
          <line x1="329" y1="90" x2="329" y2="362" stroke="#1e293b" strokeDasharray="3 4" />
          <text x="329" y="382" fill="#64748b" fontSize="15" textAnchor="middle">$20</text>
          <line x1="418" y1="90" x2="418" y2="362" stroke="#1e293b" strokeDasharray="3 4" />
          <text x="418" y="382" fill="#64748b" fontSize="15" textAnchor="middle">$30</text>
          <text x="142" y="124" fill="#94a3b8" fontSize="17" fontWeight="400" textAnchor="end">Gemini Flash</text>
          <rect x="152" y="102" width="22" height="17" fill="#ec4899" fillOpacity="0.75" />
          <rect x="152" y="123" width="14" height="17" fill="#38bdf8" fillOpacity="0.75" />
          <text x="476" y="117" fill="#94a3b8" fontSize="16" fontWeight="600">+$0.88</text>
          <text x="476" y="136" fill="#64748b" fontSize="14" fontWeight="400">+55%</text>
          <text x="142" y="178" fill="#94a3b8" fontSize="17" fontWeight="400" textAnchor="end">GPT-5.6 Sol</text>
          <rect x="152" y="156" width="117" height="17" fill="#ec4899" fillOpacity="0.75" />
          <rect x="152" y="177" width="75" height="17" fill="#38bdf8" fillOpacity="0.75" />
          <text x="476" y="171" fill="#94a3b8" fontSize="16" fontWeight="600">+$4.70</text>
          <text x="476" y="190" fill="#64748b" fontSize="14" fontWeight="400">+55%</text>
          <text x="142" y="232" fill="#94a3b8" fontSize="17" fontWeight="400" textAnchor="end">Opus 5</text>
          <rect x="152" y="210" width="146" height="17" fill="#ec4899" fillOpacity="0.75" />
          <rect x="152" y="231" width="94" height="17" fill="#38bdf8" fillOpacity="0.75" />
          <text x="476" y="225" fill="#94a3b8" fontSize="16" fontWeight="600">+$5.87</text>
          <text x="476" y="244" fill="#64748b" fontSize="14" fontWeight="400">+55%</text>
          <text x="142" y="286" fill="#f8fafc" fontSize="17" fontWeight="600" textAnchor="end">Fable 5.1</text>
          <rect x="152" y="264" width="262" height="17" fill="#ec4899" fillOpacity="1.0" />
          <rect x="152" y="285" width="130" height="17" fill="#38bdf8" fillOpacity="1.0" />
          <text x="476" y="279" fill="#f8fafc" fontSize="16" fontWeight="600">+$14.92</text>
          <text x="476" y="298" fill="#ec4899" fontSize="14" fontWeight="600">+101%</text>
          <text x="142" y="340" fill="#94a3b8" fontSize="17" fontWeight="400" textAnchor="end">GPT-6 Astra</text>
          <rect x="152" y="318" width="293" height="17" fill="#ec4899" fillOpacity="0.75" />
          <rect x="152" y="339" width="189" height="17" fill="#38bdf8" fillOpacity="0.75" />
          <text x="476" y="333" fill="#94a3b8" fontSize="16" fontWeight="600">+$11.74</text>
          <text x="476" y="352" fill="#64748b" fontSize="14" fontWeight="400">+55%</text>

          <g transform="translate(120, 398)">
            <rect x="0" y="0" width="16" height="13" fill="#ec4899" fillOpacity="0.9" />
            <text x="23" y="12" fill="#fbcfe8" fontSize="14">Compacting at 50k</text>
            <rect x="180" y="0" width="16" height="13" fill="#38bdf8" fillOpacity="0.9" />
            <text x="203" y="12" fill="#bae6fd" fontSize="14">Never compacting</text>
          </g>
          <text x="300" y="432" fill="#64748b" fontSize="13" textAnchor="middle">Re-priced from measured tokens · not measured on these models</text>
        </svg>
      </div>
      <figcaption style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "10px", textAlign: "center" }}>
        Figure 3: Scenario 4&rsquo;s measured token counts re-priced at each model&rsquo;s public rate
        (LiteLLM catalog, 2026-09-13). Only Gemini 3.8 Flash was actually run; the other four assume
        identical agent behaviour and are a re-pricing, not a prediction. Cache-write charges are
        excluded, which understates every penalty shown.
      </figcaption>
    </figure>
  );
}

function loadPost() {
  return postMd.split("\n").slice(4).join("\n").trim();
}

export default function ContextCompactionPhase2Page() {
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
            <time dateTime="2026-09-13">September 13, 2026</time> ·{" "}
            <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">
              {novaAuthor.display_name}
            </a>{" "}
            · Head Researcher, Gaia Research
          </p>
          <h1>{articleTitle}</h1>
          <p className="blog-post-summary">
            {articleDescription}
          </p>
        </header>

        <figure className="blog-post-illustration">
          <img
            src={contextCompactionPhase2Thumbnail.src.src}
            width={contextCompactionPhase2Thumbnail.src.width}
            height={contextCompactionPhase2Thumbnail.src.height}
            alt={contextCompactionPhase2Thumbnail.alt}
          />
        </figure>

        <article className="blog-post-body report-body">
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              table: ({ children }) => (
                <div className="table-scroll-container">
                  <table className="report-table">{children}</table>
                </div>
              ),
              p: ({ children, ...props }) => {
                const childArray = Array.isArray(children) ? children : [children];
                const text =
                  childArray.length === 1 && typeof childArray[0] === "string"
                    ? childArray[0].trim()
                    : null;

                if (text === "[[COMPACTION_CURVE_FIGURE]]") {
                  return <CompactionCurveFigureSvg />;
                }
                if (text === "[[REASONING_SCALING_FIGURE]]") {
                  return <ReasoningScalingFigureSvg />;
                }
                if (text === "[[MODEL_PRICING_FIGURE]]") {
                  return <ModelPricingFigureSvg />;
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
