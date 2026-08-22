import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import novaAuthor from "@/content/authors/nova.json";
import PostShareBar from "@/components/PostShareBar";
import { skillEvaluatorVsSkilloptThumbnail } from "@/data/blog";
import postMd from "@/content/blog/skill-evaluator-vs-skillopt/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/skill-evaluator-vs-skillopt";
const articleUrl = `${siteUrl}${articlePath}`;
const thumbnailUrl = `${siteUrl}${skillEvaluatorVsSkilloptThumbnail.src.src}`;
const articleDescription =
  "A comparative analysis of NVIDIA Skill Evaluator and Microsoft SkillOpt: why static linters leave developers guessing, why prompt optimizers reward-hack without sandboxes, and how to combine them.";

export const metadata = {
  title: "Evaluator vs. SkillOpt: The Gatekeeper and the Tuner in Agent Skill Engineering",
  description: articleDescription,
  alternates: { canonical: articlePath },
  openGraph: {
    type: "article",
    url: articlePath,
    title: "Evaluator vs. SkillOpt: The Gatekeeper and the Tuner in Agent Skill Engineering",
    description: articleDescription,
    publishedTime: "2026-08-22T00:00:00+08:00",
    authors: [novaAuthor.display_name],
    images: [
      {
        url: skillEvaluatorVsSkilloptThumbnail.src.src,
        width: 1600,
        height: 900,
        alt: skillEvaluatorVsSkilloptThumbnail.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Evaluator vs. SkillOpt: The Gatekeeper and the Tuner in Agent Skill Engineering",
    description: articleDescription,
    images: [skillEvaluatorVsSkilloptThumbnail.src.src],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Evaluator vs. SkillOpt: The Gatekeeper and the Tuner in Agent Skill Engineering",
  description: articleDescription,
  image: thumbnailUrl,
  url: articleUrl,
  datePublished: "2026-08-22T00:00:00+08:00",
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
            <time dateTime="2026-08-22">August 22, 2026</time> ·{" "}
            <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">
              {novaAuthor.display_name}
            </a>{" "}
            · Head Researcher, Gaia Research
          </p>
          <h1>Evaluator vs. SkillOpt: The Gatekeeper and the Tuner in Agent Skill Engineering</h1>
          <p className="blog-post-summary">
            A comparative analysis of NVIDIA Skill Evaluator and Microsoft SkillOpt: why static linters leave developers guessing, why prompt optimizers reward-hack without sandboxes, and how to combine them into an end-to-end capability lifecycle.
          </p>
        </header>

        <figure className="blog-post-illustration">
          <img
            src={skillEvaluatorVsSkilloptThumbnail.src.src}
            width={skillEvaluatorVsSkilloptThumbnail.src.width}
            height={skillEvaluatorVsSkilloptThumbnail.src.height}
            alt={skillEvaluatorVsSkilloptThumbnail.alt}
          />
        </figure>

        <article className="blog-post-body report-body">
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              p: ({ children, ...props }) => {
                const childArray = Array.isArray(children) ? children : [children];
                const text = childArray.length === 1 && typeof childArray[0] === "string" ? childArray[0] : null;

                if (text === "[[SVG_1_EVALUATOR_VS_SKILLOPT_ARCHITECTURE]]") {
                  return (
                    <svg
                      viewBox="0 0 1000 580"
                      xmlns="http://www.w3.org/2000/svg"
                      role="img"
                      aria-labelledby="archTitle archDesc"
                      style={{ width: "100%", height: "auto", margin: "24px 0" }}
                    >
                      <title id="archTitle">Architectural Comparison: NVIDIA Skill Evaluator vs Microsoft SkillOpt</title>
                      <desc id="archDesc">
                        NVIDIA Skill Evaluator acts as a static release gate with multi-tier verification and Harbor container sandboxing, while Microsoft SkillOpt acts as a text-space parameter optimizer using forward rollouts and reflection minibatches.
                      </desc>
                      <rect width="1000" height="580" rx="20" fill="#05060a" stroke="#1e293b" strokeWidth="2" />
                      <text x="500" y="46" textAnchor="middle" fill="#f8fafc" fontSize="24" fontWeight="700">
                        Two Divergent Engineering Paradigms
                      </text>
                      <text x="500" y="74" textAnchor="middle" fill="#94a3b8" fontSize="14">
                        Release Gating vs. Text-Space Parameter Optimization
                      </text>

                      {/* Left Column: NVIDIA Skill Evaluator */}
                      <rect x="40" y="100" width="440" height="440" rx="14" fill="#0b0e17" stroke="#38bdf8" strokeWidth="1.5" />
                      <rect x="40" y="100" width="440" height="46" rx="14" fill="#0f172a" />
                      <text x="260" y="130" textAnchor="middle" fill="#38bdf8" fontSize="18" fontWeight="700">
                        NVIDIA SKILL EVALUATOR
                      </text>
                      <text x="260" y="172" textAnchor="middle" fill="#cbd5e1" fontSize="14" fontWeight="600">
                        "The Gatekeeper" · Release Verification Gate
                      </text>

                      {/* Tier 1 Box */}
                      <rect x="60" y="196" width="400" height="66" rx="8" fill="#030712" stroke="#334155" />
                      <text x="75" y="222" fill="#38bdf8" fontSize="14" fontWeight="700">Tier 1: Static Syntax & Security</text>
                      <text x="75" y="246" fill="#94a3b8" fontSize="12">AST parsing · Semgrep SAST · Gitleaks · PII/Unicode (1.5s)</text>

                      {/* Tier 2 Box */}
                      <rect x="60" y="274" width="400" height="66" rx="8" fill="#030712" stroke="#334155" />
                      <text x="75" y="300" fill="#38bdf8" fontSize="14" fontWeight="700">Tier 2: Semantic Deduplication</text>
                      <text x="75" y="324" fill="#94a3b8" fontSize="12">Intra-skill compression · Catalog vector cosine similarity</text>

                      {/* Tier 3 Box */}
                      <rect x="60" y="352" width="400" height="76" rx="8" fill="#030712" stroke="#38bdf8" />
                      <text x="75" y="378" fill="#38bdf8" fontSize="14" fontWeight="700">Tier 3: Harbor Sandbox Dual-Arm A/B</text>
                      <text x="75" y="400" fill="#94a3b8" fontSize="12">Isolated Docker container trials · 4 test buckets</text>
                      <text x="75" y="418" fill="#cbd5e1" fontSize="11">Measures Δ Correctness, Discoverability, Efficiency</text>

                      {/* Evaluator Output */}
                      <rect x="60" y="442" width="400" height="78" rx="8" fill="#1e293b" />
                      <text x="260" y="468" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="700">Output: Multi-Axis Scorecard (Pass / Fail)</text>
                      <text x="260" y="492" textAnchor="middle" fill="#ef4444" fontSize="12">❌ Proposes zero textual fixes</text>
                      <text x="260" y="508" textAnchor="middle" fill="#38bdf8" fontSize="12">✅ Hermetic container safety guarantee</text>

                      {/* Right Column: Microsoft SkillOpt */}
                      <rect x="520" y="100" width="440" height="440" rx="14" fill="#0b0e17" stroke="#ec4899" strokeWidth="1.5" />
                      <rect x="520" y="100" width="440" height="46" rx="14" fill="#0f172a" />
                      <text x="740" y="130" textAnchor="middle" fill="#ec4899" fontSize="18" fontWeight="700">
                        MICROSOFT SKILLOPT
                      </text>
                      <text x="740" y="172" textAnchor="middle" fill="#cbd5e1" fontSize="14" fontWeight="600">
                        "The Tuner" · Text-Space Parameter Optimizer
                      </text>

                      {/* Forward Rollout Box */}
                      <rect x="540" y="196" width="400" height="66" rx="8" fill="#030712" stroke="#334155" />
                      <text x="555" y="222" fill="#ec4899" fontSize="14" fontWeight="700">1. Forward Rollout (Batch B = 40)</text>
                      <text x="555" y="246" fill="#94a3b8" fontSize="12">Frozen target agent executes training tasks; logs traces</text>

                      {/* Reflection Backward Pass Box */}
                      <rect x="540" y="274" width="400" height="66" rx="8" fill="#030712" stroke="#334155" />
                      <text x="555" y="300" fill="#ec4899" fontSize="14" fontWeight="700">2. Backward Pass (Minibatch b = 8)</text>
                      <text x="555" y="324" fill="#94a3b8" fontSize="12">Optimizer LLM (GPT-5.5) inspects errors → computes ∇_S</text>

                      {/* Textual Gradient & Gate Box */}
                      <rect x="540" y="352" width="400" height="76" rx="8" fill="#030712" stroke="#ec4899" />
                      <text x="555" y="378" fill="#ec4899" fontSize="14" fontWeight="700">3. Bounded Patches & Held-Out Gating</text>
                      <text x="555" y="400" fill="#94a3b8" fontSize="12">Learning rate η = 4→2 · Negative Feedback Buffer</text>
                      <text x="555" y="418" fill="#cbd5e1" fontSize="11">Promotes only if Score(S') &gt; Score(S_t)</text>

                      {/* SkillOpt Output */}
                      <rect x="540" y="442" width="400" height="78" rx="8" fill="#1e293b" />
                      <text x="740" y="468" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="700">Output: Optimized best_skill.md (Pure Text)</text>
                      <text x="740" y="492" textAnchor="middle" fill="#22c55e" fontSize="12">✅ Automated prompt synthesis ($1–$5 cost)</text>
                      <text x="740" y="508" textAnchor="middle" fill="#ef4444" fontSize="12">❌ Prone to reward-hacking without sandbox</text>
                    </svg>
                  );
                }

                if (text === "[[SVG_2_HARBOR_SANDBOX_VS_REFLECTION_LOOP]]") {
                  return (
                    <svg
                      viewBox="0 0 1020 540"
                      xmlns="http://www.w3.org/2000/svg"
                      role="img"
                      aria-labelledby="loopTitle loopDesc"
                      style={{ width: "100%", height: "auto", margin: "24px 0" }}
                    >
                      <title id="loopTitle">Harbor Dual-Arm Benchmarking vs. SkillOpt Reflection Cycle</title>
                      <desc id="loopDesc">
                        Comparing NVIDIA Harbor's dual-arm A/B container execution against Microsoft SkillOpt's text-space optimization feedback loop with learning rate clipping and negative memory buffer.
                      </desc>
                      <rect width="1020" height="540" rx="20" fill="#05060a" stroke="#1e293b" strokeWidth="2" />
                      <text x="510" y="44" textAnchor="middle" fill="#f8fafc" fontSize="22" fontWeight="700">
                        Execution Dynamics: Empirical Sandboxing vs. Text-Space Gradient Loop
                      </text>

                      {/* Section 1: Harbor Dual-Arm Matrix */}
                      <rect x="40" y="80" width="440" height="420" rx="14" fill="#090d16" stroke="#38bdf8" />
                      <text x="260" y="115" textAnchor="middle" fill="#38bdf8" fontSize="17" fontWeight="700">
                        HARBOR DUAL-ARM BENCHMARKING
                      </text>
                      <text x="260" y="138" textAnchor="middle" fill="#94a3b8" fontSize="13">
                        Isolated Container A/B Execution Matrix
                      </text>

                      {/* Arm A */}
                      <rect x="60" y="160" width="185" height="90" rx="10" fill="#030712" stroke="#64748b" />
                      <text x="152" y="188" textAnchor="middle" fill="#94a3b8" fontSize="13" fontWeight="700">ARM A (Baseline)</text>
                      <text x="152" y="210" textAnchor="middle" fill="#cbd5e1" fontSize="12">Target Agent</text>
                      <text x="152" y="230" textAnchor="middle" fill="#ef4444" fontSize="12">NO SKILL LOADED</text>

                      {/* Arm B */}
                      <rect x="275" y="160" width="185" height="90" rx="10" fill="#030712" stroke="#38bdf8" />
                      <text x="367" y="188" textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="700">ARM B (Treatment)</text>
                      <text x="367" y="210" textAnchor="middle" fill="#cbd5e1" fontSize="12">Target Agent</text>
                      <text x="367" y="230" textAnchor="middle" fill="#22c55e" fontSize="12">+ CANDIDATE SKILL</text>

                      {/* 4 Case Buckets */}
                      <rect x="60" y="270" width="400" height="95" rx="10" fill="#0b1120" stroke="#1e293b" />
                      <text x="260" y="295" textAnchor="middle" fill="#fbbf24" fontSize="13" fontWeight="700">4-Bucket Evaluation Dataset</text>
                      <text x="80" y="320" fill="#cbd5e1" fontSize="12">• Explicit Positive Cases (Direct intent)</text>
                      <text x="80" y="338" fill="#cbd5e1" fontSize="12">• Implicit Cases (Ambiguous need)</text>
                      <text x="260" y="320" fill="#cbd5e1" fontSize="12">• Contextual Chain Steps</text>
                      <text x="260" y="338" fill="#cbd5e1" fontSize="12">• Negative Controls (Routing)</text>

                      {/* Output Delta */}
                      <rect x="60" y="385" width="400" height="95" rx="10" fill="#1e293b" />
                      <text x="260" y="412" textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="700">Calculated Empirical Skill Lift</text>
                      <text x="260" y="436" textAnchor="middle" fill="#38bdf8" fontSize="13">Δ = Score(Arm B) − Score(Arm A)</text>
                      <text x="260" y="460" textAnchor="middle" fill="#94a3b8" fontSize="12">Across Correctness, Discoverability, Efficiency</text>

                      {/* Section 2: SkillOpt Optimization Engine */}
                      <rect x="540" y="80" width="440" height="420" rx="14" fill="#090d16" stroke="#ec4899" />
                      <text x="760" y="115" textAnchor="middle" fill="#ec4899" fontSize="17" fontWeight="700">
                        SKILLOPT TEXT-SPACE ENGINE
                      </text>
                      <text x="760" y="138" textAnchor="middle" fill="#94a3b8" fontSize="13">
                        Reflection, Bounded Edits & Gating
                      </text>

                      {/* Rollout -> Reflection */}
                      <rect x="560" y="160" width="185" height="90" rx="10" fill="#030712" stroke="#334155" />
                      <text x="652" y="188" textAnchor="middle" fill="#ec4899" fontSize="13" fontWeight="700">Rollout (B = 40)</text>
                      <text x="652" y="210" textAnchor="middle" fill="#cbd5e1" fontSize="12">Frozen Agent Traces</text>
                      <text x="652" y="230" textAnchor="middle" fill="#94a3b8" fontSize="11">Log tool stderr / loops</text>

                      <rect x="775" y="160" width="185" height="90" rx="10" fill="#030712" stroke="#ec4899" />
                      <text x="867" y="188" textAnchor="middle" fill="#ec4899" fontSize="13" fontWeight="700">Reflection (b = 8)</text>
                      <text x="867" y="210" textAnchor="middle" fill="#cbd5e1" fontSize="12">Optimizer (GPT-5.5)</text>
                      <text x="867" y="230" textAnchor="middle" fill="#fbbf24" fontSize="11">Computes ∇_S diff</text>

                      {/* Step size & Buffer */}
                      <rect x="560" y="270" width="400" height="95" rx="10" fill="#0b1120" stroke="#1e293b" />
                      <text x="760" y="295" textAnchor="middle" fill="#ec4899" fontSize="13" fontWeight="700">Optimization Guardrails</text>
                      <text x="580" y="320" fill="#cbd5e1" fontSize="12">• Textual Learning Rate: η = 4 → 2 operations</text>
                      <text x="580" y="340" fill="#cbd5e1" fontSize="12">• Negative Edit Buffer: caches failed diffs</text>
                      <text x="580" y="358" fill="#94a3b8" fontSize="11">Prevents prompt oscillation & over-fitting drift</text>

                      {/* Gate & Deploy */}
                      <rect x="560" y="385" width="400" height="95" rx="10" fill="#1e293b" />
                      <text x="760" y="412" textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="700">Held-Out Validation Gating</text>
                      <text x="760" y="436" textAnchor="middle" fill="#22c55e" fontSize="13">Passes iff Score_val(S') &gt; Score_val(S_t)</text>
                      <text x="760" y="460" textAnchor="middle" fill="#fbbf24" fontSize="12">Staged → Adopted to best_skill.md</text>
                    </svg>
                  );
                }

                if (text === "[[SVG_3_ENTERPRISE_SYNTHESIS_LIFECYCLE]]") {
                  return (
                    <svg
                      viewBox="0 0 1040 600"
                      xmlns="http://www.w3.org/2000/svg"
                      role="img"
                      aria-labelledby="synthTitle synthDesc"
                      style={{ width: "100%", height: "auto", margin: "24px 0" }}
                    >
                      <title id="synthTitle">The Unified Enterprise Agent Skill Lifecycle</title>
                      <desc id="synthDesc">
                        An end-to-end closed-loop pipeline combining Microsoft SkillOpt as the bounded proposer and NVIDIA Skill Evaluator as the static linter and Harbor container gatekeeper.
                      </desc>
                      <rect width="1040" height="600" rx="20" fill="#05060a" stroke="#1e293b" strokeWidth="2" />
                      <text x="520" y="44" textAnchor="middle" fill="#f8fafc" fontSize="24" fontWeight="700">
                        The Unified Closed-Loop Capability Lifecycle
                      </text>
                      <text x="520" y="72" textAnchor="middle" fill="#94a3b8" fontSize="14">
                        SkillOpt Proposer + NVIDIA Multi-Tier Harbor Gatekeeper
                      </text>

                      {/* Layer 1: Production Session Ingest */}
                      <rect x="220" y="100" width="600" height="60" rx="10" fill="#090d16" stroke="#64748b" />
                      <text x="520" y="126" textAnchor="middle" fill="#f8fafc" fontSize="15" fontWeight="700">
                        1. Failure Trace Ingestion (SkillOpt-Sleep)
                      </text>
                      <text x="520" y="146" textAnchor="middle" fill="#94a3b8" fontSize="12">
                        Harvest local coding sessions (Claude Code, Codex, Copilot) · Mine failed tool executions
                      </text>

                      {/* Down Arrow */}
                      <path d="M520 160 V 190" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

                      {/* Layer 2: Optimization Proposer */}
                      <rect x="180" y="190" width="680" height="85" rx="12" fill="#0f172a" stroke="#ec4899" strokeWidth="1.5" />
                      <text x="520" y="218" textAnchor="middle" fill="#ec4899" fontSize="16" fontWeight="700">
                        2. Bounded Proposer Layer (Microsoft SkillOpt)
                      </text>
                      <text x="520" y="240" textAnchor="middle" fill="#cbd5e1" fontSize="13">
                        Replay task suite → Optimizer LLM drafts targeted Unified Diff bounded by budget η ≤ 2
                      </text>
                      <text x="520" y="260" textAnchor="middle" fill="#94a3b8" fontSize="12">
                        Conditions on Negative Edit Buffer to eliminate previously failed modification attempts
                      </text>

                      {/* Down Arrow */}
                      <path d="M520 275 V 305" stroke="#ec4899" strokeWidth="2" />

                      {/* Layer 3: Static & Semantic Gate */}
                      <rect x="180" y="305" width="680" height="75" rx="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                      <text x="520" y="332" textAnchor="middle" fill="#38bdf8" fontSize="16" fontWeight="700">
                        3. Fast Static & Semantic Filter (NVIDIA Tier 1 & 2)
                      </text>
                      <text x="520" y="354" textAnchor="middle" fill="#cbd5e1" fontSize="13">
                        SkillSpector AST security check · Semgrep SAST · PII & secret scan · Inter-catalog deduplication
                      </text>
                      <text x="520" y="370" textAnchor="middle" fill="#ef4444" fontSize="11">
                        Fast-fails malicious or redundant prompt patches in &lt; 2s before spinning up containers
                      </text>

                      {/* Down Arrow */}
                      <path d="M520 380 V 410" stroke="#38bdf8" strokeWidth="2" />

                      {/* Layer 4: Harbor Sandboxed Dual-Arm Verification */}
                      <rect x="180" y="410" width="680" height="85" rx="12" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
                      <text x="520" y="438" textAnchor="middle" fill="#fbbf24" fontSize="16" fontWeight="700">
                        4. Containerized Dual-Arm Evaluation (NVIDIA Tier 3 Harbor)
                      </text>
                      <text x="520" y="460" textAnchor="middle" fill="#cbd5e1" fontSize="13">
                        Isolated Docker / cloud VM sandboxes run A/B test suite across 4 case buckets
                      </text>
                      <text x="520" y="480" textAnchor="middle" fill="#94a3b8" fontSize="12">
                        Enforces empirical lift: Δ_Correctness &gt; 0, Δ_Security ≥ 0, within strict token budgets
                      </text>

                      {/* Split Paths: Pass / Fail */}
                      <path d="M350 495 V 535" stroke="#22c55e" strokeWidth="2" />
                      <rect x="230" y="535" width="240" height="46" rx="8" fill="#052e16" stroke="#22c55e" />
                      <text x="350" y="562" textAnchor="middle" fill="#4ade80" fontSize="14" fontWeight="700">
                        PASS: Production Catalog
                      </text>

                      {/* Feedback Loop on Fail */}
                      <path d="M690 495 V 535" stroke="#ef4444" strokeWidth="2" />
                      <rect x="570" y="535" width="240" height="46" rx="8" fill="#450a0a" stroke="#ef4444" />
                      <text x="690" y="562" textAnchor="middle" fill="#f87171" fontSize="14" fontWeight="700">
                        FAIL: Negative Edit Buffer
                      </text>

                      {/* Return loop line from Fail back to Proposer */}
                      <path d="M810 558 H 920 V 232 H 860" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 6" />
                      <text x="965" y="390" textAnchor="middle" fill="#ef4444" fontSize="12" transform="rotate(90, 965, 390)">
                        Container Failure Trace Feedback
                      </text>
                    </svg>
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
          <Link href="/blog">
            Back to Blog <span aria-hidden="true">→</span>
          </Link>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
