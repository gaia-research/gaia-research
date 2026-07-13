/**
 * lib/craft/starter-recipes.ts
 *
 * The "aha" TECH TREE for Infinite Skill Craft.
 *
 * WHY THIS EXISTS
 * ---------------
 * The 57 canonical recipes synced from the Gaia Skill Tree (`data/craft/recipes.json`)
 * require obscure prerequisite *pairs* that players almost never reach starting from
 * the four one-word seed primitives. Result: devs never unlock skills they recognise,
 * so the very first fusions feel arbitrary instead of delightful.
 *
 * This file is a HAND-AUTHORED, deterministic tech tree layered *on top of* the four
 * seeds so that combining them yields skills devs instantly recognise — /codegen,
 * /scraper, /rag, /debug, /copilot, /tdd, /ci-cd, /agent, /swarm, /founder-mode — with
 * repeated "aha" moments as tier-1 results combine into tier-2 and tier-3 endgame skills.
 *
 * SEED PRIMITIVES (set by the UI worker): /prompt, /code, /web, /data.
 *
 * CONTRACT NOTES (for the route + UI worker that consumes this)
 * -------------------------------------------------------------
 * - Keys are `pairKey(a, b)` (order-independent, lowercased) — the SAME helper the
 *   canonical recipe map uses, so lookups compose cleanly with `findRecipe`.
 * - Each `StarterRecipe` carries a factual `description` (what the skill DOES) that
 *   maps onto the additive `description?` field on `FusionResult` / `SkillCard`.
 * - When a result corresponds to a REAL named skill in the Gaia Skill Tree, the recipe
 *   attaches the verified `{ slug, contributor }` so the consumer can derive the
 *   deep-link on the fly: `.../named/#explorer/{contributor}/{slug}`. We store ONLY
 *   slug/contributor here (not full URLs) — path derivation stays in one place.
 * - Every `{ slug, contributor }` below was verified against
 *   `gaia-skill-tree/registry/named-skills.json` (buckets → entry `id` = `contrib/slug`).
 *   Recipes with no real match intentionally omit slug/contributor — still fully
 *   chainable, just without a skill-tree link.
 *
 * Type contract for FusionResult/SkillCard: lib/craft/types.ts (frozen).
 */

import { pairKey } from './types';

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

/**
 * A hand-authored tech-tree fusion. Distinct from the registry-derived `Recipe`
 * type: a StarterRecipe always carries a factual `description` and uses short,
 * RECOGNISABLE result names rather than raw registry slugs.
 */
export interface StarterRecipe {
  /** Slash-prefixed, 1–2 word, RECOGNISABLE result name. e.g. `/scraper`, `/rag`. */
  name: string;
  /** Single representative emoji. */
  emoji: string;
  /** Playful, ≤15-word blurb addressing the reader as "boss". */
  blurb: string;
  /** Factual ~12–18 word description: what the skill actually DOES. */
  description: string;
  /** Gaia Skill Tree slug (when the result maps to a real named skill). */
  slug?: string;
  /** Gaia Skill Tree contributor handle (when the result maps to a real named skill). */
  contributor?: string;
}

// ---------------------------------------------------------------------------
// The tech tree
// ---------------------------------------------------------------------------
//
// Authored as a flat list of [a, b, StarterRecipe] tuples and folded into a
// pairKey-indexed record below. Authoring as tuples keeps the prereq pair visible
// next to its result and lets us assert "no duplicate pairKeys" at module load.

type RecipeTuple = readonly [a: string, b: string, recipe: StarterRecipe];

const TIER_1: RecipeTuple[] = [
  // --- pairs among the four primitives ---
  [
    '/prompt',
    '/code',
    {
      name: '/codegen',
      emoji: '⚙️',
      blurb: 'Boss, describe it and I type it. Carpal tunnel? Never heard of her.',
      description: 'Turns a natural-language prompt into production-ready source code, scaffolding, and boilerplate.',
      slug: 'design-html',
      contributor: 'garrytan',
    },
  ],
  [
    '/code',
    '/web',
    {
      name: '/scraper',
      emoji: '🕷️',
      blurb: 'Point me at a page, boss — I strip it for parts and leave clean JSON.',
      description: 'Extracts structured data from rendered web pages and returns clean JSON for downstream processing.',
      slug: 'scrape',
      contributor: 'garrytan',
    },
  ],
  [
    '/prompt',
    '/data',
    {
      name: '/rag',
      emoji: '📚',
      blurb: 'I read your docs so you don’t have to, boss. Cited answers, zero hallucination flexing.',
      description: 'Retrieves relevant documents and grounds language-model answers in your own data for accurate responses.',
      slug: 'orchestkit-rag',
      contributor: 'yonatangross',
    },
  ],
  [
    '/prompt',
    '/web',
    {
      name: '/search',
      emoji: '🔍',
      blurb: 'Ask me anything, boss — I hit the web and come back with receipts.',
      description: 'Interprets a natural-language query, searches the live web, and synthesizes a sourced answer.',
    },
  ],
  [
    '/code',
    '/data',
    {
      name: '/pipeline',
      emoji: '🔗',
      blurb: 'Raw in, clean out. I move your data like it owes me money, boss.',
      description: 'Chains code steps into a repeatable data pipeline that transforms inputs into structured outputs.',
    },
  ],
  [
    '/web',
    '/data',
    {
      name: '/crawler',
      emoji: '🌐',
      blurb: 'I follow every link like it’s gossip, boss, and bring the whole map home.',
      description: 'Traverses linked web pages at scale and harvests their content into a structured dataset.',
    },
  ],
  // --- element with itself, where sensible ---
  [
    '/code',
    '/code',
    {
      name: '/refactor',
      emoji: '🔄',
      blurb: 'Same behavior, half the mess. I Marie-Kondo your codebase, boss.',
      description: 'Restructures existing code to reduce complexity and improve readability without changing behavior.',
      slug: 'code-simplification',
      contributor: 'addy-osmani',
    },
  ],
  [
    '/prompt',
    '/prompt',
    {
      name: '/reason',
      emoji: '🧠',
      blurb: 'I think out loud so hard the answer just falls out, boss.',
      description: 'Decomposes a problem into explicit reasoning steps to reach a more reliable conclusion.',
    },
  ],
  [
    '/web',
    '/web',
    {
      name: '/monitor',
      emoji: '📡',
      blurb: 'I watch the feeds so you can sleep, boss. Something moves, you hear it first.',
      description: 'Continuously polls web sources and pages and emits alerts when watched content changes.',
    },
  ],
  [
    '/data',
    '/data',
    {
      name: '/analyze',
      emoji: '📊',
      blurb: 'Give me the numbers, boss — I find the story hiding in your spreadsheet.',
      description: 'Explores datasets to compute statistics, spot patterns, and surface actionable insights.',
      slug: 'huggingface-datasets',
      contributor: 'huggingface',
    },
  ],
];

const TIER_2: RecipeTuple[] = [
  [
    '/codegen',
    '/code',
    {
      name: '/debug',
      emoji: '🐞',
      blurb: 'Something broke? I hunt the bug through five phases and don’t stop till it’s dead, boss.',
      description: 'Diagnoses failing code through a disciplined reproduce-hypothesize-instrument-fix loop before regression testing.',
      slug: 'diagnose',
      contributor: 'mattpocock',
    },
  ],
  [
    '/codegen',
    '/rag',
    {
      name: '/copilot',
      emoji: '🧑‍✈️',
      blurb: 'I write your code AND remember your whole repo, boss. Basically your second brain that types.',
      description: 'Suggests code inline by grounding generation in your repository context and documentation.',
    },
  ],
  [
    '/refactor',
    '/debug',
    {
      name: '/code-review',
      emoji: '👁️',
      blurb: 'I read every diff like it insulted my mother, boss. Nothing sketchy ships.',
      description: 'Reviews pull-request diffs for bugs, style, and risk, leaving inline comments and gating approval.',
      slug: 'github-code-review',
      contributor: 'ruvnet',
    },
  ],
  [
    '/codegen',
    '/debug',
    {
      name: '/tdd',
      emoji: '🧪',
      blurb: 'Red, green, refactor. I write the test that dares your code to fail, boss.',
      description: 'Enforces a strict red-green-refactor loop, writing failing tests first and coding only to pass them.',
      slug: 'test-driven-development',
      contributor: 'addy-osmani',
    },
  ],
  [
    '/scraper',
    '/rag',
    {
      name: '/research-agent',
      emoji: '🔭',
      blurb: 'I read the whole internet on your topic and hand you the summary, boss. You’re welcome.',
      description: 'Autonomously searches, reads, and synthesizes web and paper sources into structured research summaries.',
      slug: 'autoresearch',
      contributor: 'karpathy',
    },
  ],
  [
    '/search',
    '/reason',
    {
      name: '/agent',
      emoji: '🤖',
      blurb: 'Give me a goal, boss. I’ll plan it, act on it, and check my own homework.',
      description: 'Plans and executes multi-step tasks toward a goal, calling tools and reflecting on results.',
    },
  ],
  [
    '/pipeline',
    '/data',
    {
      name: '/etl',
      emoji: '🏭',
      blurb: 'Extract, transform, load — I do the boring data plumbing so you don’t, boss.',
      description: 'Extracts data from sources, transforms it to a target schema, and loads it into a warehouse.',
    },
  ],
  // --- a few more tier-2 bridges for extra aha density ---
  [
    '/crawler',
    '/rag',
    {
      name: '/knowledge-base',
      emoji: '🗂️',
      blurb: 'I crawl it, chunk it, and make it answerable, boss. Your docs finally talk back.',
      description: 'Ingests crawled content into an indexed, queryable knowledge base for retrieval and Q&A.',
    },
  ],
  [
    '/monitor',
    '/reason',
    {
      name: '/anomaly-detector',
      emoji: '🚨',
      blurb: 'When the numbers get weird, boss, I’m already paging you about it.',
      description: 'Watches metric streams, learns normal behavior, and flags statistically anomalous events in real time.',
    },
  ],
  [
    '/analyze',
    '/pipeline',
    {
      name: '/dashboard',
      emoji: '📈',
      blurb: 'Live charts, no refresh anxiety, boss. Your metrics, always warm.',
      description: 'Aggregates pipeline outputs into live visualizations and metrics for at-a-glance monitoring.',
    },
  ],
  [
    '/rag',
    '/data',
    {
      name: '/vector-search',
      emoji: '🔭',
      blurb: 'I find the needle by vibe, boss — nearest neighbours, not exact matches.',
      description: 'Performs semantic similarity search over high-dimensional embeddings to retrieve the closest matches.',
      slug: 'agentdb-vector-search',
      contributor: 'ruvnet',
    },
  ],
  [
    '/rag',
    '/pipeline',
    {
      name: '/semantic-cache',
      emoji: '🗄️',
      blurb: 'Asked that already, boss? I remember by meaning and skip the round trip.',
      description: 'Caches LLM responses by embedding similarity so semantically equivalent queries reuse prior answers.',
      slug: 'semantic-cache',
      contributor: 'huggingface',
    },
  ],
  [
    '/reason',
    '/data',
    {
      name: '/memory',
      emoji: '🧠',
      blurb: 'I remember what mattered, boss, and forget the noise. Long-term brain, on.',
      description: 'Reads the active memory store, consolidates new observations, and dedupes them for later recall.',
      slug: 'learn',
      contributor: 'garrytan',
    },
  ],
  [
    '/crawler',
    '/code',
    {
      name: '/knowledge-graph',
      emoji: '🕸️',
      blurb: 'I turn your tangled repo into a graph you can actually ask questions of, boss.',
      description: 'Maps a codebase and docs into a queryable knowledge graph using AST analysis and semantic linking.',
      slug: 'graphify',
      contributor: 'safishamsi',
    },
  ],
  [
    '/reason',
    '/prompt',
    {
      name: '/brainstorm',
      emoji: '💡',
      blurb: 'Half-baked idea, boss? I riff on it till the shape shows up.',
      description: 'Explores intent and requirements before implementation, turning vague ideas into concrete options.',
      slug: 'brainstorming',
      contributor: 'obra',
    },
  ],
];

const TIER_3: RecipeTuple[] = [
  [
    '/agent',
    '/code',
    {
      name: '/autonomous-dev',
      emoji: '👷',
      blurb: 'Hand me a ticket and walk away, boss. I’ll be shipping the PR by lunch.',
      description: 'An agent that plans, writes, tests, and iterates on software autonomously from a task description.',
      slug: 'autonomous-swe',
      contributor: 'devin-ai',
    },
  ],
  [
    '/agent',
    '/agent',
    {
      name: '/swarm',
      emoji: '🐝',
      blurb: 'One agent is cute, boss. A swarm is a workforce that never sleeps.',
      description: 'Coordinates many agents in mesh, ring, or hierarchical topologies with shared memory and load balancing.',
      slug: 'swarm-orchestration',
      contributor: 'ruvnet',
    },
  ],
  [
    '/code-review',
    '/tdd',
    {
      name: '/ci-cd',
      emoji: '🚀',
      blurb: 'Tests pass, review’s clean — I merge and ship it before you finish your coffee, boss.',
      description: 'Automates the build-test-review-deploy pipeline so verified changes ship to production continuously.',
      slug: 'land-and-deploy',
      contributor: 'garrytan',
    },
  ],
  [
    '/agent',
    '/web',
    {
      name: '/browser-agent',
      emoji: '🖱️',
      blurb: 'I click, type, and fill forms like a caffeinated intern, boss — but on the whole web.',
      description: 'Drives a real browser to navigate pages, fill forms, and complete tasks end-to-end via automation.',
      slug: 'browser',
      contributor: 'ruvnet',
    },
  ],
  [
    '/autonomous-dev',
    '/swarm',
    {
      name: '/founder-mode',
      emoji: '👑',
      blurb: 'The whole discipline library in one crown, boss. This is the endgame.',
      description: 'Orchestrates a full agent workforce across browser QA, security, design, and planning to run development.',
      slug: 'gstack',
      contributor: 'garrytan',
    },
  ],
  // --- more endgame reaches so tier-3 has real depth ---
  [
    '/swarm',
    '/code',
    {
      name: '/multi-agent-debate',
      emoji: '⚔️',
      blurb: 'Two agents argue about your code so you don’t have to, boss. Best flaw wins.',
      description: 'Stages adversarial critique between agents over an implementation to surface hidden design flaws.',
      slug: 'codex',
      contributor: 'garrytan',
    },
  ],
  [
    '/code-review',
    '/reason',
    {
      name: '/security-audit',
      emoji: '🔐',
      blurb: 'I go through your stack like a paranoid locksmith, boss. Secrets, deps, CI — all of it.',
      description: 'Audits infrastructure and code for secrets leaks, supply-chain risk, and OWASP-class vulnerabilities.',
      slug: 'cso',
      contributor: 'garrytan',
    },
  ],
  [
    '/copilot',
    '/rag',
    {
      name: '/prompt-optimizer',
      emoji: '🎛️',
      blurb: 'I tune your prompts until they behave, boss. Fewer retries, more wins.',
      description: 'Programmatically compiles and optimizes LLM prompt pipelines using bootstrapping and evaluation.',
      slug: 'dspy',
      contributor: 'stanfordnlp',
    },
  ],
  [
    '/agent',
    '/data',
    {
      name: '/mcp-integration',
      emoji: '🔌',
      blurb: 'New tool? I wire it into the agent’s hands and test the manifest, boss.',
      description: 'Connects a new MCP server into an agent environment and validates its tool manifest end-to-end.',
      slug: 'pair-agent',
      contributor: 'garrytan',
    },
  ],
  [
    '/etl',
    '/agent',
    {
      name: '/workflow-automation',
      emoji: '🔧',
      blurb: 'Boring, repeatable, done. I turn your checklist into a workflow that runs itself, boss.',
      description: 'Designs and runs event-driven CI/CD and task workflows so repetitive work executes automatically.',
      slug: 'github-workflow-automation',
      contributor: 'ruvnet',
    },
  ],
  [
    '/swarm',
    '/agent',
    {
      name: '/parallel-agents',
      emoji: '🧵',
      blurb: 'Independent tasks? I fan them out to fresh agents and reel the results back, boss.',
      description: 'Delegates independent tasks to specialized agents with isolated context to work concurrently.',
      slug: 'dispatching-parallel-agents',
      contributor: 'obra',
    },
  ],
  [
    '/autonomous-dev',
    '/code-review',
    {
      name: '/subagent-dev',
      emoji: '🧑‍💻',
      blurb: 'Fresh subagent per task, boss, each one reviewed twice before it counts.',
      description: 'Executes a plan by dispatching a fresh subagent per task with two-stage spec-and-code review.',
      slug: 'subagent-driven-development',
      contributor: 'obra',
    },
  ],
  [
    '/debug',
    '/reason',
    {
      name: '/root-cause',
      emoji: '🔎',
      blurb: 'I don’t patch symptoms, boss — I hunt the actual cause and prove it first.',
      description: 'Finds the true root cause via minimal reproduction and ranked hypotheses before writing any fix.',
      slug: 'systematic-debugging',
      contributor: 'obra',
    },
  ],
  [
    '/code-review',
    '/pipeline',
    {
      name: '/diff-risk',
      emoji: '⚠️',
      blurb: 'I score every diff by how likely it is to blow up, boss, so review lands where it counts.',
      description: 'Analyzes git diffs for complexity, churn, and risk to prioritize where review attention should go.',
      slug: 'agentic-jujutsu',
      contributor: 'ruvnet',
    },
  ],
  [
    '/tdd',
    '/browser-agent',
    {
      name: '/e2e-testing',
      emoji: '🧖',
      blurb: 'I click through your app like a real user, boss, and document every place it flinches.',
      description: 'Drives a real browser through the app as a user would, documenting failures and edge-case breaks.',
      slug: 'qa',
      contributor: 'garrytan',
    },
  ],
  [
    '/founder-mode',
    '/agent',
    {
      name: '/flow-nexus',
      emoji: '☁️',
      blurb: 'Cloud swarm, boss — hierarchical, mesh, ring, star. Pick a shape, I run the workforce.',
      description: 'Runs cloud-based AI swarm orchestration across multiple topologies with event-driven workflows.',
      slug: 'flow-nexus-swarm',
      contributor: 'ruvnet',
    },
  ],
];

const GAIA_FLAVORED: RecipeTuple[] = [
  // Real Gaia-Research skills (verified in named-skills.json under gaia-research).
  [
    '/pipeline',
    '/reason',
    {
      name: '/ci-churn',
      emoji: '♻️',
      blurb: 'I count every wasted CI loop, boss, and tell you which commits burned the budget.',
      description: 'Measures avoidable CI iteration cost on a pull request by classifying commits and flagging churn.',
      slug: 'skill-ci-churn',
      contributor: 'gaia-research',
    },
  ],
  [
    '/agent',
    '/reason',
    {
      name: '/skill-fuse',
      emoji: '🧬',
      blurb: 'Two skills go in, one better skill comes out, boss. It’s literally what I do here.',
      description: 'Combines two agent skills into a new composite capability with a merged, coherent instruction set.',
      slug: 'skill-fuse',
      contributor: 'gaia-research',
    },
  ],
  // Gaia/company-flavored, no real named-skill match yet — still chainable, just no link.
  [
    '/rag',
    '/reason',
    {
      name: '/context-diet',
      emoji: '🥗',
      blurb: 'I trim your context window till it’s lean, boss — same brains, way fewer tokens.',
      description: 'Compresses and prunes an agent’s context so it keeps the signal while spending far fewer tokens.',
    },
  ],
  [
    '/browser-agent',
    '/pipeline',
    {
      name: '/gaia-operator',
      emoji: '🛰️',
      blurb: 'I run the whole board for you, boss — browser, pipeline, and the paperwork in between.',
      description: 'Operates end-to-end browser and pipeline workflows on your behalf across long-running multi-step tasks.',
    },
  ],
  [
    '/analyze',
    '/reason',
    {
      name: '/benchmark',
      emoji: '⚖️',
      blurb: 'I score it, compare it, and tell you if the new version is actually faster, boss.',
      description: 'Captures baseline metrics and compares current performance to grade an output or system objectively.',
      slug: 'benchmark',
      contributor: 'garrytan',
    },
  ],
  [
    '/codegen',
    '/analyze',
    {
      name: '/perf-tuning',
      emoji: '🏎️',
      blurb: 'I measure first, boss, then squeeze the slow bits till the profiler smiles.',
      description: 'Runs a measurement-driven optimization loop, baselining then fixing the hotspots that actually matter.',
      slug: 'performance-optimization',
      contributor: 'addy-osmani',
    },
  ],
  [
    '/codegen',
    '/data',
    {
      name: '/schema-design',
      emoji: '🗃️',
      blurb: 'Give me the shape of your data, boss — I design the schema and tune the queries.',
      description: 'Designs and optimizes database schemas and queries across relational, NoSQL, and graph stores.',
      slug: 'database-engineer',
      contributor: 'intelligentcode-ai',
    },
  ],
  [
    '/copilot',
    '/reason',
    {
      name: '/prd',
      emoji: '📝',
      blurb: 'I turn the whole messy conversation into a real product spec, boss. No more vibes.',
      description: 'Synthesizes conversation and codebase context into a complete, structured product requirements doc.',
      slug: 'to-prd',
      contributor: 'mattpocock',
    },
  ],
];

// ---------------------------------------------------------------------------
// Assemble + validate (no duplicate pairKeys)
// ---------------------------------------------------------------------------

const ALL_TUPLES: RecipeTuple[] = [...TIER_1, ...TIER_2, ...TIER_3, ...GAIA_FLAVORED];

function buildStarterRecipes(tuples: RecipeTuple[]): Record<string, StarterRecipe> {
  const out: Record<string, StarterRecipe> = {};
  for (const [a, b, recipe] of tuples) {
    const key = pairKey(a, b);
    if (out[key]) {
      // Fail loud at module load — a duplicate pairKey would silently shadow a recipe.
      throw new Error(
        `[starter-recipes] duplicate pairKey "${key}" (${a} + ${b} → ${recipe.name}); ` +
          `already maps to ${out[key].name}`,
      );
    }
    out[key] = recipe;
  }
  return out;
}

/**
 * Hand-authored "aha" tech tree, keyed by `pairKey(a, b)`.
 *
 * Layered in tiers so combining the four seed primitives yields recognisable
 * tier-1 skills, whose results combine into tier-2 workflows, whose results
 * combine into beloved tier-3 endgame skills — repeated aha moments by design.
 */
export const STARTER_RECIPES: Record<string, StarterRecipe> = buildStarterRecipes(ALL_TUPLES);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Look up a hand-authored starter recipe for a pair of skill names/slugs.
 *
 * Order-independent — delegates key normalisation to `pairKey(a, b)`. All keys
 * in the tree are authored slash-prefixed (seeds `/prompt` `/code` `/web` `/data`
 * and every result), matching the seed cards the UI worker sets. `pairKey`
 * lowercases + trims but preserves the slash, so pass names in slash form.
 *
 * @example
 * findStarterRecipe('/prompt', '/code')    // => { name: '/codegen', ... }
 * findStarterRecipe('/code', '/codegen')   // => { name: '/debug', ... }
 */
export function findStarterRecipe(a: string, b: string): StarterRecipe | undefined {
  return STARTER_RECIPES[pairKey(a, b)];
}
