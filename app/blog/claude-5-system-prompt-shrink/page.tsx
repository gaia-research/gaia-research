import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import novaAuthor from "@/content/authors/nova.json";
import { claude5SystemPromptShrinkThumbnail } from "@/data/blog";
import postMd from "@/content/blog/claude-5-system-prompt-shrink/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/claude-5-system-prompt-shrink";
const articleUrl = `${siteUrl}${articlePath}`;
const articleTitle = "Claude 5: Why a Smarter Model Wanted a Shorter Prompt";
const thumbnailUrl = `${siteUrl}${claude5SystemPromptShrinkThumbnail.src.src}`;
const articleDescription =
  "Claude 5 context engineering cut over 80% of Claude Code's system prompt with no measurable coding-eval loss. Test old scaffolding while preserving project facts.";

export const metadata = {
  title: articleTitle,
  description: articleDescription,
  keywords: [
    "Claude 5",
    "system prompt",
    "Claude Code",
    "Opus 5",
    "Fable 5",
    "capability overhang",
    "context engineering",
  ],
  alternates: { canonical: articlePath },
  openGraph: {
    type: "article",
    url: articlePath,
    title: articleTitle,
    description: articleDescription,
    publishedTime: "2026-07-27T00:00:00+08:00",
    authors: [novaAuthor.display_name],
    images: [{
      url: claude5SystemPromptShrinkThumbnail.src.src,
      width: 1600,
      height: 900,
      alt: claude5SystemPromptShrinkThumbnail.alt,
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
    images: [claude5SystemPromptShrinkThumbnail.src.src],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: articleTitle,
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

function loadPost() {
  // Strip H1 title & subtitle since header renders them
  return postMd.split("\n").slice(4).join("\n").trim();
}

function ContextShiftsFigure() {
  const shifts = [
    ["Rules", "Judgment"],
    ["Worked examples", "Expressive interfaces"],
    ["Everything upfront", "Progressive disclosure"],
    ["Repeated instructions", "Local tool guidance"],
  ];

  return (
    <figure className="blog-figure blog-figure-chart">
      <figcaption>How Anthropic changed context engineering for advanced Claude 5-generation models</figcaption>
      <svg viewBox="0 0 760 336" role="img" aria-labelledby="context-shifts-title context-shifts-desc">
        <title id="context-shifts-title">Four context-engineering shifts</title>
        <desc id="context-shifts-desc">
          Rules became judgment, worked examples became expressive interfaces, upfront context became progressive
          disclosure, and repeated instructions became local tool guidance.
        </desc>
        <text x="28" y="34" fill="#94a3b8" fontSize="13" fontFamily="monospace">THEN</text>
        <text x="450" y="34" fill="#94a3b8" fontSize="13" fontFamily="monospace">NOW</text>
        {shifts.map(([before, after], index) => {
          const y = 58 + index * 68;
          return (
            <g key={before}>
              <rect x="24" y={y} width="270" height="48" rx="8" fill="#111827" stroke="#334155" />
              <text x="42" y={y + 30} fill="#cbd5e1" fontSize="16">{before}</text>
              <path d={`M 318 ${y + 24} H 410`} stroke="#38bdf8" strokeWidth="2" />
              <path d={`M 400 ${y + 17} L 410 ${y + 24} L 400 ${y + 31}`} fill="none" stroke="#38bdf8" strokeWidth="2" />
              <rect x="438" y={y} width="298" height="48" rx="8" fill="#111827" stroke="#ec4899" />
              <text x="456" y={y + 30} fill="#f8fafc" fontSize="16">{after}</text>
            </g>
          );
        })}
      </svg>
      <p className="blog-svg-note">Conceptual summary of Anthropic&apos;s published “Then and now” guidance; no invented measurements.</p>
    </figure>
  );
}

function KeepOrTestFigure() {
  return (
    <figure className="blog-figure blog-figure-chart">
      <figcaption>The descaffolding decision: test inherited behavior rules; preserve non-discoverable project facts</figcaption>
      <svg viewBox="0 0 760 350" role="img" aria-labelledby="keep-test-title keep-test-desc">
        <title id="keep-test-title">What should be tested and what should be kept</title>
        <desc id="keep-test-desc">
          Model-compensating scaffolding should be relocated or tested for removal. Project-specific context should be
          kept until it is discoverable or enforced elsewhere.
        </desc>
        <rect x="24" y="22" width="344" height="282" rx="12" fill="#111827" stroke="#38bdf8" />
        <rect x="392" y="22" width="344" height="282" rx="12" fill="#111827" stroke="#ec4899" />
        <text x="48" y="58" fill="#38bdf8" fontSize="13" fontFamily="monospace">MODEL-COMPENSATING</text>
        <text x="416" y="58" fill="#ec4899" fontSize="13" fontFamily="monospace">PROJECT-SPECIFIC</text>
        <text x="48" y="92" fill="#f8fafc" fontSize="22">Relocate or test</text>
        <text x="416" y="92" fill="#f8fafc" fontSize="22">Keep until discoverable</text>
        {["Blanket “never” rules", "Worked tool examples", "Repeated reminders"].map((label, index) => (
          <text key={label} x="52" y={142 + index * 42} fill="#cbd5e1" fontSize="15">• {label}</text>
        ))}
        {["CI and runtime contracts", "Repository governance", "Scoped vocabulary rules"].map((label, index) => (
          <text key={label} x="420" y={142 + index * 42} fill="#cbd5e1" fontSize="15">• {label}</text>
        ))}
        <text x="48" y="282" fill="#94a3b8" fontSize="13">Compare the same task with and without it.</text>
        <text x="416" y="282" fill="#94a3b8" fontSize="13">Move only when another source carries the fact.</text>
        <path d="M 380 320 V 338" stroke="#64748b" />
        <text x="172" y="338" fill="#94a3b8" fontSize="13">Same question: can the agent reliably get this elsewhere?</text>
      </svg>
      <p className="blog-svg-note">Illustrative decision framework—not a measured Anthropic result.</p>
    </figure>
  );
}

function MeasurementLayersFigure() {
  const layers = [
    {
      label: "SYSTEM PROMPT",
      owner: "Anthropic",
      measure: ">80% removed",
      outcome: "No measurable coding-eval loss",
      color: "#a78bfa",
    },
    {
      label: "CLAUDE.MD",
      owner: "Context Diet",
      measure: "−41.6% · 124/124 rules",
      outcome: "Task equivalence: next test",
      color: "#38bdf8",
    },
    {
      label: "SKILLS",
      owner: "Skill Heaven",
      measure: "−97.4% standing dose",
      outcome: "Paired outcome benchmark: pending",
      color: "#ec4899",
    },
  ];

  return (
    <figure className="blog-figure blog-figure-chart">
      <figcaption>Three context layers, three distinct measurement claims</figcaption>
      <svg viewBox="0 0 760 330" role="img" aria-labelledby="measurement-layers-title measurement-layers-desc">
        <title id="measurement-layers-title">Measurements across system prompt, CLAUDE.md, and skill layers</title>
        <desc id="measurement-layers-desc">
          Anthropic measured system-prompt reduction with coding evaluations. Context Diet measured CLAUDE.md
          reduction and rule retention. Skill Heaven measured standing skill dose while its paired outcome benchmark
          remains pending.
        </desc>
        {layers.map((layer, index) => {
          const y = 18 + index * 100;
          return (
            <g key={layer.label}>
              <rect x="20" y={y} width="720" height="82" rx="10" fill="#111827" stroke={layer.color} />
              <rect x="20" y={y} width="8" height="82" rx="4" fill={layer.color} />
              <text x="48" y={y + 27} fill={layer.color} fontSize="12" fontFamily="monospace">{layer.label}</text>
              <text x="48" y={y + 57} fill="#f8fafc" fontSize="20">{layer.owner}</text>
              <text x="290" y={y + 34} fill="#f8fafc" fontSize="18">{layer.measure}</text>
              <text x="290" y={y + 61} fill="#94a3b8" fontSize="14">{layer.outcome}</text>
            </g>
          );
        })}
      </svg>
      <p className="blog-svg-note">
        Different denominators: Anthropic measured system-prompt text and coding evaluations; Gaia&apos;s figures
        measure CLAUDE.md characters/rules and skill standing dose. Gaia task-equivalence trials are not complete.
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
            <time dateTime="2026-07-27">July 27, 2026</time> · {" "}
            <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">
              {novaAuthor.display_name}
            </a>
          </p>
          <h1>{articleTitle}</h1>
          <p className="blog-post-summary">
            A more capable model asked for less instruction, not more — and the reason is a line worth drawing in your own harness.
          </p>
        </header>

        <figure className="blog-post-illustration">
          <img
            src={claude5SystemPromptShrinkThumbnail.src.src}
            width={claude5SystemPromptShrinkThumbnail.src.width}
            height={claude5SystemPromptShrinkThumbnail.src.height}
            alt={claude5SystemPromptShrinkThumbnail.alt}
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
                if (text === "[[CONTEXT_SHIFTS]]") {
                  return <ContextShiftsFigure />;
                }
                if (text === "[[KEEP_OR_TEST]]") {
                  return <KeepOrTestFigure />;
                }
                if (text === "[[MEASUREMENT_LAYERS]]") {
                  return <MeasurementLayersFigure />;
                }
                if (text === "[[YOUTUBE_EMBED]]") {
                  return (
                    <figure className="blog-video">
                      <iframe
                        src="https://www.youtube-nocookie.com/embed/9fubhllmsBU"
                        title="Field Guide to Fable — Thariq Shihipar, Anthropic"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      <figcaption>
                        Thariq Shihipar of Anthropic presents “Field Guide to Fable” at AI Engineer World&apos;s Fair.
                      </figcaption>
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
