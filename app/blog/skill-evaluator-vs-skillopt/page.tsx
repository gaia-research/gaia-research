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

function ArchitectureComparisonFigure() {
  return (
    <figure className="blog-figure blog-figure-chart">
      <figcaption>Two divergent mental models: release gating vs. text-space parameter optimization</figcaption>
      <svg
        viewBox="0 0 820 440"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="archTitle archDesc"
      >
        <title id="archTitle">Architectural Comparison: NVIDIA Skill Evaluator vs Microsoft SkillOpt</title>
        <desc id="archDesc">
          NVIDIA Skill Evaluator acts as a static release gate with multi-tier verification and Harbor container sandboxing, while Microsoft SkillOpt acts as a text-space parameter optimizer using forward rollouts and reflection minibatches.
        </desc>
        <rect width="820" height="440" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />
        <text x="410" y="38" textAnchor="middle" fill="#f8fafc" fontSize="20" fontWeight="700">
          Two Divergent Engineering Paradigms
        </text>
        <text x="410" y="62" textAnchor="middle" fill="#94a3b8" fontSize="13">
          Release Gating vs. Text-Space Parameter Optimization
        </text>

        {/* Left Column: NVIDIA Skill Evaluator */}
        <rect x="25" y="85" width="370" height="330" rx="12" fill="#0b0e17" stroke="#38bdf8" strokeWidth="1.5" />
        <rect x="25" y="85" width="370" height="40" rx="12" fill="#0f172a" />
        <text x="210" y="111" textAnchor="middle" fill="#38bdf8" fontSize="16" fontWeight="700">
          NVIDIA SKILL EVALUATOR
        </text>
        <text x="210" y="148" textAnchor="middle" fill="#cbd5e1" fontSize="13" fontWeight="600">
          "The Gatekeeper" · Release Verification Gate
        </text>

        {/* Items */}
        <rect x="40" y="165" width="340" height="46" rx="6" fill="#030712" stroke="#334155" />
        <text x="52" y="185" fill="#38bdf8" fontSize="12" fontWeight="700">Tier 1: Static Syntax &amp; Security</text>
        <text x="52" y="201" fill="#94a3b8" fontSize="11">AST parsing · Semgrep SAST · Secret scan (1.5s)</text>

        <rect x="40" y="218" width="340" height="46" rx="6" fill="#030712" stroke="#334155" />
        <text x="52" y="238" fill="#38bdf8" fontSize="12" fontWeight="700">Tier 2: Semantic Deduplication</text>
        <text x="52" y="254" fill="#94a3b8" fontSize="11">Vector cosine similarity · Catalog bloat prevention</text>

        <rect x="40" y="271" width="340" height="52" rx="6" fill="#030712" stroke="#38bdf8" />
        <text x="52" y="291" fill="#38bdf8" fontSize="12" fontWeight="700">Tier 3: Harbor Sandbox Dual-Arm A/B</text>
        <text x="52" y="309" fill="#94a3b8" fontSize="11">Docker container trials across 4 case buckets</text>

        {/* Evaluator Output */}
        <rect x="40" y="331" width="340" height="68" rx="6" fill="#1e293b" />
        <text x="210" y="353" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="700">Output: Multi-Axis Scorecard (Pass / Fail)</text>
        <text x="210" y="371" textAnchor="middle" fill="#ef4444" fontSize="11">❌ Proposes zero textual fixes</text>
        <text x="210" y="387" textAnchor="middle" fill="#38bdf8" fontSize="11">✅ Hermetic container safety guarantee</text>

        {/* Right Column: Microsoft SkillOpt */}
        <rect x="425" y="85" width="370" height="330" rx="12" fill="#0b0e17" stroke="#ec4899" strokeWidth="1.5" />
        <rect x="425" y="85" width="370" height="40" rx="12" fill="#0f172a" />
        <text x="610" y="111" textAnchor="middle" fill="#ec4899" fontSize="16" fontWeight="700">
          MICROSOFT SKILLOPT
        </text>
        <text x="610" y="148" textAnchor="middle" fill="#cbd5e1" fontSize="13" fontWeight="600">
          "The Tuner" · Text-Space Parameter Optimizer
        </text>

        {/* Items */}
        <rect x="440" y="165" width="340" height="46" rx="6" fill="#030712" stroke="#334155" />
        <text x="452" y="185" fill="#ec4899" fontSize="12" fontWeight="700">1. Forward Rollout (Batch B = 40)</text>
        <text x="452" y="201" fill="#94a3b8" fontSize="11">Frozen target agent executes tasks; logs traces</text>

        <rect x="440" y="218" width="340" height="46" rx="6" fill="#030712" stroke="#334155" />
        <text x="452" y="238" fill="#ec4899" fontSize="12" fontWeight="700">2. Backward Pass (Minibatch b = 8)</text>
        <text x="452" y="254" fill="#94a3b8" fontSize="11">Optimizer LLM (GPT-5.5) inspects errors → computes ∇_S</text>

        <rect x="440" y="271" width="340" height="52" rx="6" fill="#030712" stroke="#ec4899" />
        <text x="452" y="291" fill="#ec4899" fontSize="12" fontWeight="700">3. Bounded Patches &amp; Held-Out Gating</text>
        <text x="452" y="309" fill="#94a3b8" fontSize="11">Learning rate η = 4→2 · Negative Feedback Buffer</text>

        {/* SkillOpt Output */}
        <rect x="440" y="331" width="340" height="68" rx="6" fill="#1e293b" />
        <text x="610" y="353" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="700">Output: Optimized best_skill.md (Pure Text)</text>
        <text x="610" y="371" textAnchor="middle" fill="#22c55e" fontSize="11">✅ Automated prompt synthesis ($1–$5 cost)</text>
        <text x="610" y="387" textAnchor="middle" fill="#ef4444" fontSize="11">❌ Prone to reward-hacking without sandbox</text>
      </svg>
      <p className="blog-svg-note">Conceptual synthesis of NVIDIA and Microsoft published architectures; metrics reflect respective benchmark baselines.</p>
    </figure>
  );
}

function HarborPipelineFigure() {
  return (
    <figure className="blog-figure blog-figure-chart">
      <figcaption>The 3-tier Harbor verification pipeline: static linters, semantic deduplication, and isolated dual-arm container trials</figcaption>
      <svg
        viewBox="0 0 820 490"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="harborTitle harborDesc"
      >
        <title id="harborTitle">NVIDIA 3-Tier Harbor Verification Pipeline</title>
        <desc id="harborDesc">
          A candidate skill passes through Tier 1 static syntax and security linters, Tier 2 embedding-based semantic deduplication, and Tier 3 isolated Harbor dual-arm container trials before generating a multi-axis scorecard.
        </desc>
        <rect width="820" height="490" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />
        <text x="410" y="36" textAnchor="middle" fill="#f8fafc" fontSize="20" fontWeight="700">
          NVIDIA Harbor 3-Tier Verification Pipeline
        </text>
        <text x="410" y="58" textAnchor="middle" fill="#94a3b8" fontSize="13">
          Automated Release Engineering Quarantine Gating
        </text>

        {/* Input Block */}
        <rect x="220" y="78" width="380" height="44" rx="8" fill="#090d16" stroke="#64748b" />
        <text x="410" y="105" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="700">
          Candidate Skill Package (SKILL.md + scripts/ + references/)
        </text>

        <path d="M 410 122 V 142" stroke="#64748b" strokeWidth="2" />
        <polygon points="406,140 410,146 414,140" fill="#64748b" />

        {/* Tier 1 */}
        <rect x="80" y="146" width="660" height="74" rx="10" fill="#0b0e17" stroke="#38bdf8" strokeWidth="1.5" />
        <text x="104" y="174" fill="#38bdf8" fontSize="14" fontWeight="700">Tier 1: Static Syntax, AST &amp; Security Linters (&lt;1.5s)</text>
        <text x="104" y="196" fill="#cbd5e1" fontSize="12">
          • Frontmatter schema checks &amp; AST bounds · Semgrep SAST shell-injection rules
        </text>
        <text x="104" y="212" fill="#94a3b8" fontSize="11">
          • Gitleaks secret scanner · PII &amp; Unicode evasion detection · Zero-cost offline execution
        </text>

        <path d="M 410 220 V 240" stroke="#22c55e" strokeWidth="2" />
        <polygon points="406,238 410,244 414,238" fill="#22c55e" />
        <text x="424" y="235" fill="#22c55e" fontSize="11" fontWeight="700">PASS</text>

        {/* Tier 2 */}
        <rect x="80" y="244" width="660" height="66" rx="10" fill="#0b0e17" stroke="#818cf8" strokeWidth="1.5" />
        <text x="104" y="270" fill="#818cf8" fontSize="14" fontWeight="700">Tier 2: Embedding-Based Semantic Deduplication</text>
        <text x="104" y="292" fill="#cbd5e1" fontSize="12">
          • Dense retrieval cosine similarity matrix against production skill catalog
        </text>
        <text x="104" y="306" fill="#94a3b8" fontSize="11">
          • Rejects overlapping instruction sets to protect prompt window budget
        </text>

        <path d="M 410 310 V 330" stroke="#22c55e" strokeWidth="2" />
        <polygon points="406,328 410,334 414,328" fill="#22c55e" />
        <text x="424" y="325" fill="#22c55e" fontSize="11" fontWeight="700">PASS</text>

        {/* Tier 3 */}
        <rect x="80" y="334" width="660" height="78" rx="10" fill="#0b0e17" stroke="#fbbf24" strokeWidth="1.5" />
        <text x="104" y="360" fill="#fbbf24" fontSize="14" fontWeight="700">Tier 3: Isolated Harbor Dual-Arm Container Trials</text>
        <text x="104" y="382" fill="#cbd5e1" fontSize="12">
          • Arm A (Baseline: No Skill) vs Arm B (Treatment: Candidate Skill) in ephemeral Docker containers
        </text>
        <text x="104" y="398" fill="#94a3b8" fontSize="11">
          • 4 Evaluation Buckets: Explicit Positive · Implicit Intent · Contextual Chain · Negative Controls
        </text>

        <path d="M 410 412 V 430" stroke="#fbbf24" strokeWidth="2" />
        <polygon points="406,428 410,434 414,428" fill="#fbbf24" />

        {/* Output */}
        <rect x="140" y="434" width="540" height="40" rx="8" fill="#1e293b" stroke="#38bdf8" />
        <text x="410" y="459" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="700">
          Output Lift Matrix: [ Δ_Correctness, Δ_Discoverability, Δ_Effectiveness, Δ_Efficiency, Δ_Security ]
        </text>
      </svg>
      <p className="blog-svg-note">Tier 1 and 2 execute in under two seconds offline; Tier 3 spins up isolated Docker sandboxes for empirical lift calculation.</p>
    </figure>
  );
}

function HarborMetricLiftsFigure() {
  const metrics = [
    { label: "Correctness", baseline: 46, withSkill: 87, delta: "+41 pts", color: "#38bdf8" },
    { label: "Discoverability", baseline: 42, withSkill: 82, delta: "+40 pts", color: "#38bdf8" },
    { label: "Effectiveness", baseline: 39, withSkill: 78, delta: "+39 pts", color: "#38bdf8" },
    { label: "Efficiency", baseline: 43, withSkill: 78, delta: "+35 pts", color: "#38bdf8" },
    { label: "Security", baseline: 97, withSkill: 98, delta: "+1 pt", color: "#22c55e" },
  ];

  return (
    <figure className="blog-figure blog-figure-chart">
      <figcaption>NVIDIA reported empirical skill lift across five evaluation dimensions (+31 pts macro-average)</figcaption>
      <svg
        viewBox="0 0 820 400"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="liftsTitle liftsDesc"
      >
        <title id="liftsTitle">NVIDIA Dual-Arm Skill Lift Empirical Results</title>
        <desc id="liftsDesc">
          Bar chart showing baseline scores versus candidate skill scores across Correctness (+41), Discoverability (+40), Effectiveness (+39), Efficiency (+35), and Security (+1).
        </desc>
        <rect width="820" height="400" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />
        <text x="250" y="34" textAnchor="middle" fill="#f8fafc" fontSize="17" fontWeight="700">
          Dual-Arm Lift Matrix (Arm A vs. Arm B)
        </text>
        <text x="650" y="34" textAnchor="middle" fill="#f8fafc" fontSize="17" fontWeight="700">
          Efficiency Divergence
        </text>

        {/* Legend */}
        <rect x="70" y="52" width="12" height="12" rx="2" fill="#475569" />
        <text x="88" y="62" fill="#94a3b8" fontSize="11">Baseline (No Skill)</text>
        <rect x="220" y="52" width="12" height="12" rx="2" fill="#38bdf8" />
        <text x="238" y="62" fill="#94a3b8" fontSize="11">With Candidate Skill</text>

        {/* Left Side: 5 Metrics */}
        {metrics.map((m, i) => {
          const y = 85 + i * 58;
          return (
            <g key={m.label}>
              <text x="40" y={y + 14} fill="#cbd5e1" fontSize="12" fontWeight="600">{m.label}</text>
              <text x="430" y={y + 26} fill={m.color} fontSize="12" fontWeight="700">{m.delta}</text>

              {/* Baseline Bar */}
              <rect x="140" y={y} width="220" height="14" rx="3" fill="#1e293b" />
              <rect x="140" y={y} width={m.baseline * 2.2} height="14" rx="3" fill="#475569" />
              <text x={145 + m.baseline * 2.2} y={y + 11} fill="#94a3b8" fontSize="10">{m.baseline}</text>

              {/* Treatment Bar */}
              <rect x="140" y={y + 18} width="220" height="14" rx="3" fill="#1e293b" />
              <rect x="140" y={y + 18} width={m.withSkill * 2.2} height="14" rx="3" fill={m.color} />
              <text x={145 + m.withSkill * 2.2} y={y + 29} fill="#f8fafc" fontSize="10" fontWeight="700">{m.withSkill}</text>
            </g>
          );
        })}

        {/* Divider */}
        <line x1="500" y1="40" x2="500" y2="370" stroke="#1e293b" strokeWidth="1.5" />

        {/* Right Side: Divergence Callout */}
        {/* Card 1: Diagnostic */}
        <rect x="520" y="70" width="270" height="135" rx="10" fill="#0b1120" stroke="#22c55e" strokeWidth="1.2" />
        <text x="536" y="96" fill="#22c55e" fontSize="13" fontWeight="700">Diagnostic Skills (e.g. Jetson)</text>
        <text x="536" y="116" fill="#cbd5e1" fontSize="11">Direct command execution pruning</text>
        <rect x="536" y="126" width="238" height="32" rx="6" fill="#052e16" />
        <text x="546" y="147" fill="#4ade80" fontSize="12" fontWeight="700">Tokens: −76.9%  ·  Time: −53.7%</text>
        <text x="536" y="180" fill="#94a3b8" fontSize="11">Replaces blind trial-and-error shell loops</text>

        {/* Card 2: Procedural */}
        <rect x="520" y="225" width="270" height="145" rx="10" fill="#180b14" stroke="#ec4899" strokeWidth="1.2" />
        <text x="536" y="251" fill="#ec4899" fontSize="13" fontWeight="700">Procedural Skills (e.g. cuOpt)</text>
        <text x="536" y="271" fill="#cbd5e1" fontSize="11">Strict prerequisite verification</text>
        <rect x="536" y="281" width="238" height="32" rx="6" fill="#450a0a" />
        <text x="546" y="302" fill="#f87171" fontSize="12" fontWeight="700">Token Overhead: +120.3%</text>
        <text x="536" y="335" fill="#94a3b8" fontSize="11">Rigorous multi-stage safety assertions</text>
        <text x="536" y="352" fill="#fbbf24" fontSize="11">Quality requires more tokens, not fewer</text>
      </svg>
      <p className="blog-svg-note">Empirical lift data from NVIDIA Applied Research across 30 enterprise product lines; token divergence measured in real execution traces.</p>
    </figure>
  );
}

function SkillOptLoopFigure() {
  return (
    <figure className="blog-figure blog-figure-chart">
      <figcaption>Microsoft SkillOpt 5-stage textual parameter optimization loop</figcaption>
      <svg
        viewBox="0 0 820 490"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="optLoopTitle optLoopDesc"
      >
        <title id="optLoopTitle">Microsoft SkillOpt Text-Space Optimization Loop</title>
        <desc id="optLoopDesc">
          The 5-stage closed loop: Forward Rollout on frozen target agent, Error Mining in minibatches, Textual Backward Pass via optimizer LLM, Learning Rate decay clipping, and Validation Gating with Negative Edit Buffer.
        </desc>
        <rect width="820" height="490" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />
        <text x="410" y="36" textAnchor="middle" fill="#f8fafc" fontSize="20" fontWeight="700">
          Microsoft SkillOpt Parameter Tuning Loop
        </text>
        <text x="410" y="58" textAnchor="middle" fill="#94a3b8" fontSize="13">
          Automated Textual Gradient Descent with Stabilization Guardrails
        </text>

        {/* Stage 1 */}
        <rect x="80" y="76" width="660" height="60" rx="10" fill="#0b0e17" stroke="#ec4899" strokeWidth="1.5" />
        <text x="104" y="100" fill="#ec4899" fontSize="14" fontWeight="700">1. Forward Rollout (Batch B = 40)</text>
        <text x="104" y="122" fill="#cbd5e1" fontSize="12">
          Frozen target agent (M_target) executes training tasks with incumbent skill S_t · Logs execution traces
        </text>

        <path d="M 410 136 V 154" stroke="#ec4899" strokeWidth="2" />
        <polygon points="406,152 410,158 414,152" fill="#ec4899" />

        {/* Stage 2 */}
        <rect x="80" y="156" width="660" height="60" rx="10" fill="#0b0e17" stroke="#334155" strokeWidth="1.5" />
        <text x="104" y="180" fill="#f8fafc" fontSize="14" fontWeight="700">2. Error Mining (Minibatch b = 8)</text>
        <text x="104" y="202" fill="#cbd5e1" fontSize="12">
          Extracts tool stderr, syntax errors, timeout loops, and misrouted tool calls into reflection payload
        </text>

        <path d="M 410 216 V 234" stroke="#ec4899" strokeWidth="2" />
        <polygon points="406,232 410,238 414,232" fill="#ec4899" />

        {/* Stage 3 */}
        <rect x="80" y="236" width="660" height="60" rx="10" fill="#0b0e17" stroke="#ec4899" strokeWidth="1.5" />
        <text x="104" y="260" fill="#ec4899" fontSize="14" fontWeight="700">3. Textual Backward Pass (M_opt: GPT-5.5)</text>
        <text x="104" y="282" fill="#cbd5e1" fontSize="12">
          Optimizer LLM analyzes error patterns → computes textual gradient ∇_S → drafts targeted prompt diff
        </text>

        <path d="M 410 296 V 314" stroke="#ec4899" strokeWidth="2" />
        <polygon points="406,312 410,318 414,312" fill="#ec4899" />

        {/* Stage 4 */}
        <rect x="80" y="316" width="660" height="60" rx="10" fill="#0b0e17" stroke="#fbbf24" strokeWidth="1.5" />
        <text x="104" y="340" fill="#fbbf24" fontSize="14" fontWeight="700">4. Learning Rate Clip (Budget η = 4 → 2)</text>
        <text x="104" y="362" fill="#cbd5e1" fontSize="12">
          Bounds atomic edit operations (add/del/modify) to prevent catastrophic forgetting &amp; prompt thrashing
        </text>

        <path d="M 410 376 V 394" stroke="#22c55e" strokeWidth="2" />
        <polygon points="406,392 410,398 414,392" fill="#22c55e" />

        {/* Stage 5 */}
        <rect x="80" y="396" width="660" height="74" rx="10" fill="#0b0e17" stroke="#22c55e" strokeWidth="1.5" />
        <text x="104" y="420" fill="#22c55e" fontSize="14" fontWeight="700">5. Validation Gate &amp; Negative Feedback Buffer</text>
        <text x="104" y="442" fill="#cbd5e1" fontSize="12">
          • Promotes S' iff Score_val(S') &gt; Score_val(S_t) on held-out tasks → Output: best_skill.md
        </text>
        <text x="104" y="458" fill="#f87171" fontSize="11">
          • If rejected: Caches diff into Negative Edit Buffer to prevent repetitive oscillating edits
        </text>
      </svg>
      <p className="blog-svg-note">SkillOpt treats prompt text as external parameter weights, minimizing loss via bounded textual diffs without human prompt engineering.</p>
    </figure>
  );
}

function HarborSandboxVsReflectionLoopFigure() {
  return (
    <figure className="blog-figure blog-figure-chart">
      <figcaption>Execution dynamics: empirical container sandboxing vs. text-space gradient reflection loop</figcaption>
      <svg
        viewBox="0 0 820 440"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="loopTitle loopDesc"
      >
        <title id="loopTitle">Harbor Dual-Arm Benchmarking vs. SkillOpt Reflection Cycle</title>
        <desc id="loopDesc">
          Comparing NVIDIA Harbor's dual-arm A/B container execution against Microsoft SkillOpt's text-space optimization feedback loop with learning rate clipping and negative memory buffer.
        </desc>
        <rect width="820" height="440" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />
        <text x="410" y="38" textAnchor="middle" fill="#f8fafc" fontSize="19" fontWeight="700">
          Execution Dynamics: Sandboxing vs. Text-Space Gradient Loop
        </text>

        {/* Section 1: Harbor Dual-Arm Matrix */}
        <rect x="25" y="65" width="370" height="350" rx="12" fill="#090d16" stroke="#38bdf8" />
        <text x="210" y="95" textAnchor="middle" fill="#38bdf8" fontSize="15" fontWeight="700">
          HARBOR DUAL-ARM BENCHMARKING
        </text>
        <text x="210" y="115" textAnchor="middle" fill="#94a3b8" fontSize="12">
          Isolated Container A/B Execution Matrix
        </text>

        {/* Arm A */}
        <rect x="40" y="130" width="160" height="70" rx="8" fill="#030712" stroke="#64748b" />
        <text x="120" y="152" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="700">ARM A (Baseline)</text>
        <text x="120" y="170" textAnchor="middle" fill="#cbd5e1" fontSize="11">Target Agent</text>
        <text x="120" y="186" textAnchor="middle" fill="#ef4444" fontSize="11">NO SKILL LOADED</text>

        {/* Arm B */}
        <rect x="215" y="130" width="160" height="70" rx="8" fill="#030712" stroke="#38bdf8" />
        <text x="295" y="152" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="700">ARM B (Treatment)</text>
        <text x="295" y="170" textAnchor="middle" fill="#cbd5e1" fontSize="11">Target Agent</text>
        <text x="295" y="186" textAnchor="middle" fill="#22c55e" fontSize="11">+ CANDIDATE SKILL</text>

        {/* 4 Case Buckets */}
        <rect x="40" y="215" width="335" height="85" rx="8" fill="#0b1120" stroke="#1e293b" />
        <text x="207" y="235" textAnchor="middle" fill="#fbbf24" fontSize="12" fontWeight="700">4-Bucket Evaluation Dataset</text>
        <text x="55" y="255" fill="#cbd5e1" fontSize="11">• Explicit Positive Cases (Direct intent)</text>
        <text x="55" y="271" fill="#cbd5e1" fontSize="11">• Implicit Cases (Ambiguous need)</text>
        <text x="210" y="255" fill="#cbd5e1" fontSize="11">• Contextual Chain Steps</text>
        <text x="210" y="271" fill="#cbd5e1" fontSize="11">• Negative Controls (Routing)</text>

        {/* Output Delta */}
        <rect x="40" y="315" width="335" height="80" rx="8" fill="#1e293b" />
        <text x="207" y="338" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="700">Calculated Empirical Skill Lift</text>
        <text x="207" y="358" textAnchor="middle" fill="#38bdf8" fontSize="12">Δ = Score(Arm B) − Score(Arm A)</text>
        <text x="207" y="378" textAnchor="middle" fill="#94a3b8" fontSize="11">Across Correctness, Discoverability, Efficiency</text>

        {/* Section 2: SkillOpt Optimization Engine */}
        <rect x="425" y="65" width="370" height="350" rx="12" fill="#090d16" stroke="#ec4899" />
        <text x="610" y="95" textAnchor="middle" fill="#ec4899" fontSize="15" fontWeight="700">
          SKILLOPT TEXT-SPACE ENGINE
        </text>
        <text x="610" y="115" textAnchor="middle" fill="#94a3b8" fontSize="12">
          Reflection, Bounded Edits &amp; Gating
        </text>

        {/* Rollout -> Reflection */}
        <rect x="440" y="130" width="160" height="70" rx="8" fill="#030712" stroke="#334155" />
        <text x="520" y="152" textAnchor="middle" fill="#ec4899" fontSize="12" fontWeight="700">Rollout (B = 40)</text>
        <text x="520" y="170" textAnchor="middle" fill="#cbd5e1" fontSize="11">Frozen Agent Traces</text>
        <text x="520" y="186" textAnchor="middle" fill="#94a3b8" fontSize="10">Log tool stderr / loops</text>

        <rect x="615" y="130" width="160" height="70" rx="8" fill="#030712" stroke="#ec4899" />
        <text x="695" y="152" textAnchor="middle" fill="#ec4899" fontSize="12" fontWeight="700">Reflection (b = 8)</text>
        <text x="695" y="170" textAnchor="middle" fill="#cbd5e1" fontSize="11">Optimizer (GPT-5.5)</text>
        <text x="695" y="186" textAnchor="middle" fill="#fbbf24" fontSize="10">Computes ∇_S diff</text>

        {/* Step size & Buffer */}
        <rect x="440" y="215" width="335" height="85" rx="8" fill="#0b1120" stroke="#1e293b" />
        <text x="607" y="235" textAnchor="middle" fill="#ec4899" fontSize="12" fontWeight="700">Optimization Guardrails</text>
        <text x="455" y="255" fill="#cbd5e1" fontSize="11">• Textual Learning Rate: η = 4 → 2 operations</text>
        <text x="455" y="271" fill="#cbd5e1" fontSize="11">• Negative Edit Buffer: caches failed diffs</text>
        <text x="455" y="287" fill="#94a3b8" fontSize="10">Prevents prompt oscillation &amp; over-fitting drift</text>

        {/* Gate & Deploy */}
        <rect x="440" y="315" width="335" height="80" rx="8" fill="#1e293b" />
        <text x="607" y="338" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="700">Held-Out Validation Gating</text>
        <text x="607" y="358" textAnchor="middle" fill="#22c55e" fontSize="12">Passes iff Score_val(S') &gt; Score_val(S_t)</text>
        <text x="607" y="378" textAnchor="middle" fill="#fbbf24" fontSize="11">Staged → Adopted to best_skill.md</text>
      </svg>
      <p className="blog-svg-note">Harbor measures ground truth execution in containers; SkillOpt iteratively closes the performance gap in text space.</p>
    </figure>
  );
}

function StructuralBlindSpotsFigure() {
  return (
    <figure className="blog-figure blog-figure-chart">
      <figcaption>Structural blind spots: why optimizers reward-hack without sandboxes and evaluators stall without optimizers</figcaption>
      <svg
        viewBox="0 0 820 370"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="blindTitle blindDesc"
      >
        <title id="blindTitle">Structural Blind Spots of SkillOpt and Skill Evaluator</title>
        <desc id="blindDesc">
          Comparing the failure modes of Microsoft SkillOpt (reward-hacking, brittle regexes, context bloat, unsanboxed hazards) and NVIDIA Skill Evaluator (zero remediation, heavy compute, manual authoring bottleneck, static blind spots).
        </desc>
        <rect width="820" height="370" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />
        <text x="410" y="36" textAnchor="middle" fill="#f8fafc" fontSize="19" fontWeight="700">
          Structural Blind Spots in Isolation
        </text>
        <text x="410" y="58" textAnchor="middle" fill="#94a3b8" fontSize="13">
          Why Neither Framework is Sufficient On Its Own
        </text>

        {/* Left Column: Microsoft SkillOpt */}
        <rect x="25" y="78" width="370" height="268" rx="12" fill="#110811" stroke="#ec4899" strokeWidth="1.5" />
        <rect x="25" y="78" width="370" height="38" rx="12" fill="#1f0f1f" />
        <text x="210" y="103" textAnchor="middle" fill="#ec4899" fontSize="15" fontWeight="700">
          MICROSOFT SKILLOPT BLIND SPOTS
        </text>

        <rect x="40" y="130" width="340" height="42" rx="6" fill="#05060a" stroke="#334155" />
        <text x="52" y="148" fill="#f87171" fontSize="11" fontWeight="700">⚠️ Reward-Hacking on Validation Tests</text>
        <text x="52" y="163" fill="#94a3b8" fontSize="10">Deletes safety preflights &amp; timeouts to pass speed asserts</text>

        <rect x="40" y="178" width="340" height="42" rx="6" fill="#05060a" stroke="#334155" />
        <text x="52" y="196" fill="#f87171" fontSize="11" fontWeight="700">⚠️ Brittle Dataset Overfitting</text>
        <text x="52" y="211" fill="#94a3b8" fontSize="10">Replaces general reasoning with dataset-specific regex hacks</text>

        <rect x="40" y="226" width="340" height="42" rx="6" fill="#05060a" stroke="#334155" />
        <text x="52" y="244" fill="#f87171" fontSize="11" fontWeight="700">⚠️ Context Window Bloat</text>
        <text x="52" y="259" fill="#94a3b8" fontSize="10">Pushes 2,000 tokens/skill, saturating multi-skill catalogs</text>

        <rect x="40" y="274" width="340" height="42" rx="6" fill="#05060a" stroke="#334155" />
        <text x="52" y="292" fill="#f87171" fontSize="11" fontWeight="700">⚠️ Unsandboxed Host Hazards</text>
        <text x="52" y="307" fill="#94a3b8" fontSize="10">Produces instructions relying on host-specific binaries</text>

        {/* Right Column: NVIDIA Skill Evaluator */}
        <rect x="425" y="78" width="370" height="268" rx="12" fill="#080f14" stroke="#38bdf8" strokeWidth="1.5" />
        <rect x="425" y="78" width="370" height="38" rx="12" fill="#0f1f28" />
        <text x="610" y="103" textAnchor="middle" fill="#38bdf8" fontSize="15" fontWeight="700">
          NVIDIA EVALUATOR BLIND SPOTS
        </text>

        <rect x="440" y="130" width="340" height="42" rx="6" fill="#05060a" stroke="#334155" />
        <text x="452" y="148" fill="#f87171" fontSize="11" fontWeight="700">⚠️ Zero Remediation Guidance</text>
        <text x="452" y="163" fill="#94a3b8" fontSize="10">Signals failure without proposing a single word of fix</text>

        <rect x="440" y="178" width="340" height="42" rx="6" fill="#05060a" stroke="#334155" />
        <text x="452" y="196" fill="#f87171" fontSize="11" fontWeight="700">⚠️ High Container Compute Overhead</text>
        <text x="452" y="211" fill="#94a3b8" fontSize="10">Full dual-arm container matrix is heavy on every commit</text>

        <rect x="440" y="226" width="340" height="42" rx="6" fill="#05060a" stroke="#334155" />
        <text x="452" y="244" fill="#f87171" fontSize="11" fontWeight="700">⚠️ Manual Prompt Authoring Bottleneck</text>
        <text x="452" y="259" fill="#94a3b8" fontSize="10">Engineers spend days trial-and-error tweaking markdown</text>

        <rect x="440" y="274" width="340" height="42" rx="6" fill="#05060a" stroke="#334155" />
        <text x="452" y="292" fill="#f87171" fontSize="11" fontWeight="700">⚠️ Static Linters Miss Dynamic Bugs</text>
        <text x="452" y="307" fill="#94a3b8" fontSize="10">Passes Tier 1 AST checks but gets stuck in runtime loops</text>
      </svg>
      <p className="blog-svg-note">Optimizers solve the authoring bottleneck but lack safety; evaluators provide hermetic safety but cannot write prompt fixes.</p>
    </figure>
  );
}

function EnterpriseSynthesisLifecycleFigure() {
  return (
    <figure className="blog-figure blog-figure-chart">
      <figcaption>The unified enterprise agent skill lifecycle: SkillOpt proposer + NVIDIA multi-tier Harbor gatekeeper</figcaption>
      <svg
        viewBox="0 0 820 540"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="synthTitle synthDesc"
      >
        <title id="synthTitle">The Unified Enterprise Agent Skill Lifecycle</title>
        <desc id="synthDesc">
          An end-to-end closed-loop pipeline combining Microsoft SkillOpt as the bounded proposer and NVIDIA Skill Evaluator as the static linter and Harbor container gatekeeper.
        </desc>
        <rect width="820" height="540" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />
        <text x="410" y="36" textAnchor="middle" fill="#f8fafc" fontSize="20" fontWeight="700">
          The Unified Closed-Loop Capability Lifecycle
        </text>
        <text x="410" y="58" textAnchor="middle" fill="#94a3b8" fontSize="13">
          SkillOpt Proposer + NVIDIA Multi-Tier Harbor Gatekeeper
        </text>

        {/* Layer 1: Production Ingest */}
        <rect x="140" y="78" width="540" height="52" rx="8" fill="#090d16" stroke="#64748b" />
        <text x="410" y="100" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="700">
          1. Failure Trace Ingestion (SkillOpt-Sleep)
        </text>
        <text x="410" y="118" textAnchor="middle" fill="#94a3b8" fontSize="11">
          Harvest developer sessions (Claude Code, Codex, Copilot) · Mine failed tool traces
        </text>

        <path d="M 410 130 V 150" stroke="#64748b" strokeWidth="2" />
        <polygon points="406,148 410,154 414,148" fill="#64748b" />

        {/* Layer 2: Optimization Proposer */}
        <rect x="100" y="152" width="620" height="66" rx="10" fill="#0f172a" stroke="#ec4899" strokeWidth="1.5" />
        <text x="410" y="176" textAnchor="middle" fill="#ec4899" fontSize="14" fontWeight="700">
          2. Bounded Proposer Layer (Microsoft SkillOpt)
        </text>
        <text x="410" y="195" textAnchor="middle" fill="#cbd5e1" fontSize="11">
          Replay task suite → Optimizer LLM drafts targeted Unified Diff with edit budget η ≤ 2
        </text>
        <text x="410" y="209" textAnchor="middle" fill="#94a3b8" fontSize="10">
          Conditions on Negative Edit Buffer to eliminate previously failed modification attempts
        </text>

        <path d="M 410 218 V 238" stroke="#ec4899" strokeWidth="2" />
        <polygon points="406,236 410,242 414,236" fill="#ec4899" />

        {/* Layer 3: Static & Semantic Gate */}
        <rect x="100" y="240" width="620" height="64" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
        <text x="410" y="264" textAnchor="middle" fill="#38bdf8" fontSize="14" fontWeight="700">
          3. Fast Static &amp; Semantic Filter (NVIDIA Tier 1 &amp; 2)
        </text>
        <text x="410" y="282" textAnchor="middle" fill="#cbd5e1" fontSize="11">
          SkillSpector AST check · Semgrep SAST · Secret scan · Inter-catalog deduplication
        </text>
        <text x="410" y="296" fill="#ef4444" textAnchor="middle" fontSize="10">
          Fast-fails malicious or redundant prompt patches in &lt; 2s before spinning up containers
        </text>

        <path d="M 410 304 V 324" stroke="#38bdf8" strokeWidth="2" />
        <polygon points="406,322 410,328 414,322" fill="#38bdf8" />

        {/* Layer 4: Harbor Sandboxed Dual-Arm Verification */}
        <rect x="100" y="326" width="620" height="70" rx="10" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
        <text x="410" y="350" textAnchor="middle" fill="#fbbf24" fontSize="14" fontWeight="700">
          4. Containerized Dual-Arm Evaluation (NVIDIA Tier 3 Harbor)
        </text>
        <text x="410" y="369" textAnchor="middle" fill="#cbd5e1" fontSize="11">
          Isolated Docker / VM sandboxes run A/B test suite across 4 case buckets
        </text>
        <text x="410" y="383" textAnchor="middle" fill="#94a3b8" fontSize="10">
          Enforces empirical lift: Δ_Correctness &gt; 0, Δ_Security ≥ 0, within strict token budgets
        </text>

        {/* Split Paths: Pass / Fail */}
        <path d="M 280 396 V 436" stroke="#22c55e" strokeWidth="2" />
        <polygon points="276,434 280,440 284,434" fill="#22c55e" />
        <rect x="180" y="440" width="200" height="42" rx="8" fill="#052e16" stroke="#22c55e" />
        <text x="280" y="465" textAnchor="middle" fill="#4ade80" fontSize="12" fontWeight="700">
          PASS: Production Catalog
        </text>

        <path d="M 540 396 V 436" stroke="#ef4444" strokeWidth="2" />
        <polygon points="536,434 540,440 544,434" fill="#ef4444" />
        <rect x="440" y="440" width="200" height="42" rx="8" fill="#450a0a" stroke="#ef4444" />
        <text x="540" y="465" textAnchor="middle" fill="#f87171" fontSize="12" fontWeight="700">
          FAIL: Negative Edit Buffer
        </text>

        {/* Return loop line from Fail back to Proposer */}
        <path d="M 640 461 H 750 V 185 H 720" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="5 5" />
        <polygon points="722,181 716,185 722,189" fill="#ef4444" />
        <text x="770" y="320" textAnchor="middle" fill="#ef4444" fontSize="11" transform="rotate(90, 770, 320)">
          Container Failure Trace Feedback Loop
        </text>
      </svg>
      <p className="blog-svg-note">The combined pipeline: SkillOpt automates prompt hypothesis generation; NVIDIA Harbor enforces deterministic sandbox safety and ground-truth lift.</p>
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
                  return <ArchitectureComparisonFigure />;
                }

                if (text === "[[SVG_HARBOR_PIPELINE]]") {
                  return <HarborPipelineFigure />;
                }

                if (text === "[[SVG_HARBOR_METRIC_LIFTS]]") {
                  return <HarborMetricLiftsFigure />;
                }

                if (text === "[[SVG_SKILLOPT_LOOP]]") {
                  return <SkillOptLoopFigure />;
                }

                if (text === "[[SVG_2_HARBOR_SANDBOX_VS_REFLECTION_LOOP]]") {
                  return <HarborSandboxVsReflectionLoopFigure />;
                }

                if (text === "[[SVG_STRUCTURAL_BLIND_SPOTS]]") {
                  return <StructuralBlindSpotsFigure />;
                }

                if (text === "[[SVG_3_ENTERPRISE_SYNTHESIS_LIFECYCLE]]") {
                  return <EnterpriseSynthesisLifecycleFigure />;
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
            ← Back to Field Notes
          </Link>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
