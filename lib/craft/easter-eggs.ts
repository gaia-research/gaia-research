/**
 * lib/craft/easter-eggs.ts
 *
 * Hand-authored Easter Egg zoo for Infinite Skill Craft.
 *
 * Every entry is a pre-registered surprise combo — dev memes, architecture
 * horror stories, AI-era laments, and Gaia self-referential gags.
 *
 * Lookup key = pairKey(a, b) from lib/craft/types.ts (sorted, lowercased, "+"-joined).
 * The inputs in the RECIPE comment show the canonical pair; pairKey normalises order.
 *
 * Conceptual ancestor: Neal Agarwal's Infinite Craft (https://neal.fun/infinite-craft/)
 * This file is 100 % original content — homage, not a fork.
 *
 * Blurb contract:
 *   - ≤ 15 words
 *   - Addresses the reader as "boss"
 *   - Actually funny (no exceptions)
 */

import { pairKey } from './types';

// ---------------------------------------------------------------------------
// Egg shape
// ---------------------------------------------------------------------------

export interface EasterEgg {
  /** Slash-command display name shown on the card, e.g. "/works-on-my-machine". */
  name: string;
  /** One representative emoji. */
  emoji: string;
  /** ≤ 15-word flavour text. Addresses reader as "boss". */
  blurb: string;
  /** True when this egg applies a curse from lib/craft/curses.ts. */
  cursed?: boolean;
  /** The curse id to activate (from CURSES record). */
  curseId?: string;
}

// ---------------------------------------------------------------------------
// The Zoo
// ---------------------------------------------------------------------------

/**
 * All hand-authored Easter Eggs keyed by pairKey(a, b).
 * Inputs are noted in inline comments for discoverability; pairKey handles order.
 */
export const EASTER_EGGS: Record<string, EasterEgg> = {

  // ─── 🔥 Dev classics ──────────────────────────────────────────────────────

  // /code-execution + /browser-control
  [pairKey('code-execution', 'browser-control')]: {
    name: '/works-on-my-machine',
    emoji: '🖥️',
    blurb: "Deploys with 0 % confidence and 100 % conviction, boss.",
  },

  // /error-interpretation + /self-critique
  [pairKey('error-interpretation', 'self-critique')]: {
    name: '/skill-issue',
    emoji: '💅',
    blurb: "Logs the bug as user error. You wrote the bug, boss.",
  },

  // /tool-use + /memory-manage
  [pairKey('tool-use', 'memory-manage')]: {
    name: '/exit-vim',
    emoji: '🚪',
    blurb: "Ultimate skill. Boss, success rate is 12 %.",
  },

  // /parse-html + /logical-inference
  [pairKey('parse-html', 'logical-inference')]: {
    name: '/parse-html-with-regex',
    emoji: '🐙',
    blurb: "CURSED. Summons Cthulhu from the angle-bracket abyss, boss.",
    cursed: true,
    curseId: 'parse-html-with-regex',
  },

  // /question-answer + /code-explain
  [pairKey('question-answer', 'code-explain')]: {
    name: '/rubber-duck',
    emoji: '🦆',
    blurb: "Duck says nothing. Bug is fixed. You're welcome, boss.",
  },

  // /code-generation + /format-output
  [pairKey('code-generation', 'format-output')]: {
    name: '/printf-debugging',
    emoji: '🖨️',
    blurb: "Prints HERE, HERE2, WHY, WTF. Ships anyway, boss.",
  },

  // /retrieve + /research
  [pairKey('retrieve', 'research')]: {
    name: '/stackoverflow-copy-paste',
    emoji: '📋',
    blurb: "Ships accepted answer from 2011. Tests optional, boss.",
  },

  // /tool-select + /workflow-automation
  [pairKey('tool-select', 'workflow-automation')]: {
    name: '/npm-install',
    emoji: '📦',
    blurb: "400 MB of node_modules to print 'Hello', boss.",
  },

  // /chunk-document + /context-compression
  [pairKey('chunk-document', 'context-compression')]: {
    name: '/left-pad',
    emoji: '🧨',
    blurb: "Eleven lines. Broke the internet. Legendary, boss.",
  },

  // /refactor-code + /code-review-pipeline
  [pairKey('refactor-code', 'code-review-pipeline')]: {
    name: '/rewrite-in-rust',
    emoji: '🦀',
    blurb: "Reflexive answer to every performance question, boss.",
  },

  // /requirements-analysis + /plan-decompose
  [pairKey('requirements-analysis', 'plan-decompose')]: {
    name: '/yak-shave',
    emoji: '🐃',
    blurb: "Fixed a typo. Rewrote the build system. Classic, boss.",
  },

  // /diff-content + /code-execution
  [pairKey('diff-content', 'code-execution')]: {
    name: '/force-push-main',
    emoji: '💣',
    blurb: "CURSED. Erases your coworker's entire Friday, boss.",
    cursed: true,
    curseId: 'force-push-main',
  },

  // /self-critique + /write-report
  [pairKey('self-critique', 'write-report')]: {
    name: '/git-blame-yourself',
    emoji: '👻',
    blurb: "The bug was you, six months ago. Always you, boss.",
  },

  // /error-interpretation + /generate-text
  [pairKey('error-interpretation', 'generate-text')]: {
    name: '/undefined-is-not-a-function',
    emoji: '🫥',
    blurb: "CURSED. JavaScript's love language. Embrace it, boss.",
    cursed: true,
    curseId: 'undefined-is-not-a-function',
  },

  // /structured-output + /parse-json
  [pairKey('structured-output', 'parse-json')]: {
    name: '/semicolon-anxiety',
    emoji: '⚠️',
    blurb: "Adds semicolons to Python files prophylactically, boss.",
  },

  // ─── 🧊 Architecture memes ────────────────────────────────────────────────

  // /workflow-automation + /domain-modeling
  [pairKey('workflow-automation', 'domain-modeling')]: {
    name: '/kubernetes-for-todo-app',
    emoji: '☸️',
    blurb: "CURSED. 47 pods, 3 regions, one checkbox, boss.",
    cursed: true,
    curseId: 'kubernetes-for-todo-app',
  },

  // /parallel-execution + /route-intent
  [pairKey('parallel-execution', 'route-intent')]: {
    name: '/microservices-for-two-users',
    emoji: '🔀',
    blurb: "89 services. One customer. Latency: yes, boss.",
  },

  // /memory-manage + /retrieve
  [pairKey('memory-manage', 'retrieve')]: {
    name: '/legacy-code',
    emoji: '🗿',
    blurb: "Load-bearing. Written by Steve (left 2014). Do not touch, boss.",
  },

  // /few-shot-learning + /autonomous-web-research
  [pairKey('few-shot-learning', 'autonomous-web-research')]: {
    name: '/bus-factor-of-one',
    emoji: '🚌',
    blurb: "Only Steve understands payments. Steve is on PTO, boss.",
  },

  // /structured-output + /format-output
  [pairKey('structured-output', 'format-output')]: {
    name: '/yaml-engineer',
    emoji: '📐',
    blurb: "Indents for a living. Tabs vs spaces: still ongoing, boss.",
  },

  // /data-visualize + /statistical-analysis
  [pairKey('data-visualize', 'statistical-analysis')]: {
    name: '/mongodb-is-web-scale',
    emoji: '🥭',
    blurb: "CURSED. Screams 'web scale' into the void. No schema, boss.",
    cursed: true,
    curseId: 'mongodb-is-web-scale',
  },

  // /browser-automation + /computer-use
  [pairKey('browser-automation', 'computer-use')]: {
    name: '/fixed-in-prod',
    emoji: '🤠',
    blurb: "SSH cowboy. Editing live. God is watching, boss.",
  },

  // ─── 🤖 AI-era ────────────────────────────────────────────────────────────

  // /generate-text + /code-generation
  [pairKey('generate-text', 'code-generation')]: {
    name: '/vibe-coding',
    emoji: '🌊',
    blurb: "Prompts until it works. Reads zero diff, boss.",
  },

  // /chain-of-thought + /generate-text
  [pairKey('chain-of-thought', 'generate-text')]: {
    name: '/prompt-engineer',
    emoji: '🪄',
    blurb: "Whispers to models. Job title: 2023–2025, boss.",
  },

  // /api-call + /code-generation
  [pairKey('api-call', 'code-generation')]: {
    name: '/ai-wrapper-startup',
    emoji: '💰',
    blurb: "12 lines + one OpenAI key + Series A. Congrats, boss.",
  },

  // /plan-decompose + /route-intent
  [pairKey('plan-decompose', 'route-intent')]: {
    name: '/agents-md-inception',
    emoji: '🌀',
    blurb: "AGENTS.md references AGENTS.md references AGENTS.md, boss.",
  },

  // /code-generation + /tool-use
  [pairKey('code-generation', 'tool-use')]: {
    name: '/copilot-dependency',
    emoji: '🦾',
    blurb: "Forgets how to write `for` loops when offline, boss.",
  },

  // /refactor-code + /structured-output
  [pairKey('refactor-code', 'structured-output')]: {
    name: '/cursor-tab-tab-tab',
    emoji: '⌨️',
    blurb: "Ships 400 lines. Reads zero. Tab. Tab. Tab, boss.",
  },

  // /tool-select + /generate-text
  [pairKey('tool-select', 'generate-text')]: {
    name: '/hallucinated-import',
    emoji: '👻',
    blurb: "LLM invents a library. You pip-install it anyway, boss.",
  },

  // ─── 🎀 Gaia self-referential ─────────────────────────────────────────────

  // /context-compression + /chunk-document
  [pairKey('context-compression', 'chunk-document')]: {
    name: '/context-diet',
    emoji: '🥗',
    blurb: "Fuses with bloat, returns a lean `-lite` variant, boss.",
  },

  // /generate-text + /sentiment-analysis
  [pairKey('generate-text', 'sentiment-analysis')]: {
    name: '/milim-hype',
    emoji: '👑',
    blurb: "Adds 👑 and three exclamation points to everything, boss!!!",
  },

  // /evaluate-output + /cite-sources
  [pairKey('evaluate-output', 'cite-sources')]: {
    name: '/nova-actually',
    emoji: '🔬',
    blurb: "Rewrites your blurb with citations. Well, actually, boss.",
  },

  // /hypothesis-generate + /write-report
  [pairKey('hypothesis-generate', 'write-report')]: {
    name: '/first-10-evidence-sprint',
    emoji: '🧾',
    blurb: "Turns vague hype into a proof pack by Friday, boss.",
  },

  // /security-audit + /retrieve
  [pairKey('security-audit', 'retrieve')]: {
    name: '/read-only-on-skill-tree',
    emoji: '🔒',
    blurb: "Refuses all writes. Silent success. Very Zen, boss.",
  },

  // /computer-use + /plan-decompose
  [pairKey('computer-use', 'plan-decompose')]: {
    name: '/boss-mode',
    emoji: '🎀',
    blurb: "Fuses with anything. Returns a personal note to you, boss.",
  },

  // /browser-control + /code-execution
  [pairKey('browser-control', 'code-execution')]: {
    name: '/pi-coding-agent',
    emoji: '🥧',
    blurb: "The harness that summoned this whole mess. Cheers, boss.",
  },

  // ─── 💀 Scout additions — more dev-horror ─────────────────────────────────

  // /generate-sql + /security-audit
  [pairKey('generate-sql', 'security-audit')]: {
    name: '/sql-injection-oops',
    emoji: '💉',
    blurb: "Shipped `'; DROP TABLE users; --`. Oops, boss.",
  },

  // /code-generation + /classify
  [pairKey('code-generation', 'classify')]: {
    name: '/use-any-type',
    emoji: '🤷',
    blurb: "TypeScript is just JavaScript with more regrets, boss.",
  },

  // /diff-content + /parallel-execution
  [pairKey('diff-content', 'parallel-execution')]: {
    name: '/merge-conflicts-resolved-wrong',
    emoji: '💥',
    blurb: "Accepted both sides. Feature works. Tests fail. Ship it, boss.",
  },

  // /tool-select + /workflow-automation  (second hit — reroute to a distinct pair)
  // /retrieve + /workflow-automation
  [pairKey('retrieve', 'tool-select')]: {
    name: '/dependency-hell',
    emoji: '🕸️',
    blurb: "Needs lodash@3 AND lodash@4. Both installed. Good luck, boss.",
  },

  // /api-call + /route-intent
  [pairKey('api-call', 'route-intent')]: {
    name: '/callback-pyramid-of-doom',
    emoji: '🔺',
    blurb: "Twelve levels of nesting. Error param is always first, boss.",
  },

  // /code-generation + /document-editing
  [pairKey('code-generation', 'document-editing')]: {
    name: '/hardcoded-credentials-in-github',
    emoji: '🔑',
    blurb: "Password123 is in git history. It always was, boss.",
  },

  // /code-explain + /refactor-code
  [pairKey('code-explain', 'refactor-code')]: {
    name: '/spaghetti-architecture',
    emoji: '🍝',
    blurb: "Circular imports. No layers. Tastes like regret, boss.",
  },

  // /automated-testing + /code-generation
  [pairKey('automated-testing', 'code-generation')]: {
    name: '/100-percent-coverage-zero-confidence',
    emoji: '🧪',
    blurb: "Every branch covered. Zero bugs caught. Classic, boss.",
  },

  // /feed-monitoring + /error-interpretation
  [pairKey('feed-monitoring', 'error-interpretation')]: {
    name: '/alert-fatigue',
    emoji: '🔔',
    blurb: "PagerDuty at 3 AM for the fourteenth time this week, boss.",
  },

  // /data-visualize + /domain-modeling
  [pairKey('data-visualize', 'domain-modeling')]: {
    name: '/accidental-n-plus-one',
    emoji: '📉',
    blurb: "One page load. 847 SQL queries. Totally on purpose, boss.",
  },

  // /context-compression + /memory-manage
  [pairKey('context-compression', 'memory-manage')]: {
    name: '/infinite-scroll-regret',
    emoji: '♾️',
    blurb: "Added infinite scroll. User lost their place forever, boss.",
  },

  // /translate + /structured-output
  [pairKey('translate', 'structured-output')]: {
    name: '/iso-8601-timezone-nightmare',
    emoji: '🕰️',
    blurb: "Event was 11 PM yesterday or 8 AM Tuesday. Who knows, boss.",
  },

  // /embed-text + /vector-search
  [pairKey('embed-text', 'vector-search')]: {
    name: '/rag-hallucination',
    emoji: '🌫️',
    blurb: "Retrieved the docs. Invented the answer. Confidently, boss.",
  },

  // /few-shot-learning + /code-generation
  [pairKey('few-shot-learning', 'code-generation')]: {
    name: '/leetcode-grind',
    emoji: '📚',
    blurb: "Solved 500 graph problems. Writes CRUD apps for work, boss.",
  },

  // /logical-inference + /evaluate-output
  [pairKey('logical-inference', 'evaluate-output')]: {
    name: '/bikeshed-argument',
    emoji: '🎨',
    blurb: "Spent 3 sprints on button color. Shipped zero features, boss.",
  },

  // /parse-pdf + /extract-entities
  [pairKey('parse-pdf', 'extract-entities')]: {
    name: '/regex-that-works-once',
    emoji: '🎲',
    blurb: "Passes every test. Fails every production string, boss.",
  },

  // /math-reason + /hypothesis-generate
  [pairKey('math-reason', 'hypothesis-generate')]: {
    name: '/estimate-is-now-a-deadline',
    emoji: '📅',
    blurb: "Said '2 weeks' off the cuff. Boss put it in the roadmap.",
  },

  // /speech-to-text + /text-to-speech
  [pairKey('speech-to-text', 'text-to-speech')]: {
    name: '/meeting-that-could-have-been-email',
    emoji: '😶',
    blurb: "45 minutes. Outcome: schedule a follow-up, boss.",
  },

  // /image-generate + /feed-monitoring
  [pairKey('image-generate', 'feed-monitoring')]: {
    name: '/dark-pattern-ux',
    emoji: '🕳️',
    blurb: "Unsubscribe button is 4 px, grey, and wrong domain, boss.",
  },

  // /cite-sources + /web-search
  [pairKey('cite-sources', 'web-search')]: {
    name: '/wikipedia-citation-needed',
    emoji: '📖',
    blurb: "Source: trust me, boss. [citation needed].",
  },

  // /summarize + /question-answer
  [pairKey('summarize', 'question-answer')]: {
    name: '/tldr-that-misses-the-point',
    emoji: '📄',
    blurb: "Summary omits the one thing that mattered, boss.",
  },

};

// ---------------------------------------------------------------------------
// Lookup helper
// ---------------------------------------------------------------------------

/**
 * Returns the EasterEgg for a given pair of skill slugs, or undefined if no
 * hand-authored entry exists.
 *
 * Uses pairKey so order of (a, b) does not matter.
 *
 * @example
 * findEasterEgg('parse-html', 'logical-inference')
 * // => { name: '/parse-html-with-regex', emoji: '🐙', ... cursed: true }
 */
export function findEasterEgg(a: string, b: string): EasterEgg | undefined {
  return EASTER_EGGS[pairKey(a, b)];
}
