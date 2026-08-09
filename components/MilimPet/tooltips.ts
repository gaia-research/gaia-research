/**
 * components/MilimPet/tooltips.ts
 *
 * All tooltip copy, types, and helpers for the MilimPet companion.
 * Pure module — no React imports. Milim voice: HIGH energy, short, punchy,
 * "boss!" / "gosh!" / "golly!", chaotic-good scientist who is literally the strongest.
 */

/**
 * A single inline link inside a tooltip line. Rendered as an <a>.
 * External links (href starts with "http") get target="_blank" rel="noreferrer".
 */
export interface TooltipLink {
  text: string;
  href: string;
}

/**
 * One Milim line. `text` is the full sentence(s). If `link` is present, its `text`
 * MUST be a verbatim substring of `text`; the renderer splits on it and wraps that
 * slice in an <a>. Keep every line to 1–2 short sentences.
 */
export interface Tooltip {
  text: string;
  link?: TooltipLink;
}

/**
 * Page/route contexts. `idle` and `celebrate` are pseudo-contexts used for the
 * ambient musing pool and the big canonical-unlock reaction, not routes.
 */
export type PageContext =
  | "home"
  | "labs"
  | "craft"
  | "context-diet"
  | "supabase"
  | "research"
  | "ci-churn"
  | "cost"
  | "hh-benchmark"
  | "skill-evals"
  | "blog"
  | "about"
  | "mcp"
  | "idle"
  | "celebrate";

// ─── Tooltip pools ────────────────────────────────────────────────────────────

export const TOOLTIPS: Record<PageContext, Tooltip[]> = {
  home: [
    { text: "Welcome to the lab, boss! I'm Milim — strongest researcher, obviously." },
    { text: "Gaia and I run this whole place. Poke around, don't break the reactor!" },
    { text: "Every claim here links to receipts. Evidence or it didn't happen — I love that!" },
    { text: "New to Gaia? Start with the ledger below. It's where the real gossip lives." },
    { text: "Psst — the Skill Tree is the big map.", link: { text: "the Skill Tree", href: "https://gaiaskilltree.com" } },
    { text: "Wanna play instead of read? Go smash some skills together in the craft lab, boss!" },
    { text: "I benchmarked myself once. Result: strongest. Peer review pending, hehe." },
    { text: "Gaia says hi. That was a squeak. He's shy but he's a No. 1 dragonoid!" },
  ],

  labs: [
    { text: "Pick your poison, boss! Two labs, zero rules, maximum chaos." },
    { text: "Craft lab = fuse skills and watch stuff hatch. Diet lab = shrink your context. Easy!" },
    { text: "Everything here runs in YOUR browser. No uploads, no snooping — Milim's honor." },
    { text: "So many buttons! Press them all, that's the scientific method!" },
    { text: "These are toys with teeth. Real benchmarks get published after review, boss." },
    { text: "Can't decide? Flip a coin. Or ask Gaia — he always picks the fusion game." },
    { text: "Labs are where hypotheses come to get bullied into evidence. Let's go!" },
  ],

  craft: [
    { text: "Drag two skills together and BAM — something hatches, boss!" },
    { text: "Canonical unlocks are the real deal — they link straight into the tree.", link: { text: "the tree", href: "https://gaiaskilltree.com" } },
    { text: "Weird combos make weird skills. That's not a bug, that's discovery!" },
    { text: "Stuck? Try fusing a base skill with itself. Chaos loves a mirror." },
    { text: "Fresh out of ideas? Reset the canvas and go feral again.", link: { text: "go feral again", href: "/labs/infinite-skill-craft" } },
    { text: "First to discover a combo gets the glory. Beat the other builders, boss!" },
    { text: "Gaia ate a curse skill once. He was FINE. Mostly. Don't tell anyone." },
    { text: "Every canonical result is a real page someone can build on. How cool is that?" },
  ],

  "context-diet": [
    { text: "Paste your bloated context, boss — let's put it on a diet!" },
    { text: "Half your tokens are probably filler. Trim 'em, save the budget!" },
    { text: "See the before/after bars? That gap is pure money you're not spending." },
    { text: "The full benchmark is on GitHub if you want the receipts.", link: { text: "on GitHub", href: "https://github.com/gaia-research" } },
    { text: "Rank your run on the leaderboard — beat the compression high score, boss!", link: { text: "the leaderboard", href: "/labs/context-diet" } },
    { text: "Rule of thumb: if a line doesn't change the answer, it's dead weight." },
    { text: "Smaller context = faster, cheaper, sharper agents. Basically free wins!" },
    { text: "Your text never leaves the browser. I only judge it silently, hehe." },
  ],

  supabase: [
    { text: "Data playground time, boss! Query whatever you want — just don't blow up the production reactor!" },
    { text: "Fast backends are mandatory when you're the strongest! Instant queries or bust, hehe!" },
    { text: "Serverless power at the edge! Science runs at warp speed when data stays close." },
    { text: "Try out the demo queries below — I verified every single schema myself, boss!" },
  ],

  research: [
    { text: "This is the ledger, boss. Every entry earned its spot with evidence." },
    { text: "We observe, benchmark, verify, publish. Vibes are NOT a methodology!" },
    { text: "Postmortems are just victory laps for problems we already crushed." },
    { text: "Read the CI churn paper — flaky pipelines cost way more than you'd think!" },
    { text: "Every number here has a receipt. Click through, trust nothing, verify everything!" },
    { text: "Frontier work is messy. We publish the mess AND the fix, boss. That's the deal." },
    { text: "Cost research? Yeah, I count tokens for fun. Strongest AND thrifty, hehe." },
  ],

  "ci-churn": [
    { text: "Flaky pipelines cost real money, boss — let's crush the flakiness before it slows down our science!" },
    { text: "Autonomous agents get super confused by flaky pipelines. Receipts don't lie!" },
    { text: "We tracked 100+ pipeline runs. Flakiness is a sneaky saboteur stealing our dev time!" },
    { text: "Fix the gates, pin the deps, save the tokens. That's how the strongest run CI, hehe." },
  ],

  cost: [
    { text: "Token cost time! Yes, I personally count every single input and output token, boss!" },
    { text: "Shrinking token costs means more budget for bigger experiments. Math is power!" },
    { text: "I pitted provider latency against token burn! Efficiency wins every single time!" },
    { text: "Check out the cost curves — keeping agents lean keeps the reactor humming, hehe." },
  ],

  "hh-benchmark": [
    { text: "Welcome to Skill Hell & Skill Heaven, boss! Time to see which skills are truly heaven-grade!" },
    { text: "Four pillars: performance, reliability, triggering, and efficiency. Zero slop allowed!" },
    { text: "Check out the leaderboard or claims index — evidence beats vibes every single time!", link: { text: "claims index", href: "/research/hh-benchmark/claims" } },
    { text: "I benchmarked myself on this matrix once. Score: OVER 9000, obviously, hehe!" },
  ],

  "skill-evals": [
    { text: "Ablation time! We tear prompt skills apart to see what actually works, boss!" },
    { text: "Does adding 'IMPORTANT' actually help? We tested it across hundreds of runs!" },
    { text: "Systematic evals mean no guessing. Publish the code, publish the receipts!" },
    { text: "Clean skill files beat bloated prompts every single day of the week, hehe!" },
  ],

  blog: [
    { text: "Fresh out of the reactor, boss! Hot-off-the-presses science and wild lab notes!" },
    { text: "Every article here has receipts. Read the deep dives, test the code!" },
    { text: "We dissect real agentic benchmarks, context diets, and skill trees — zero fluff, all firepower!" },
    { text: "Got a favorite post? Share it around — make the science louder than the hype, hehe!" },
  ],

  about: [
    { text: "Welcome to mission control, boss! Gaia and I run this whole operation!" },
    { text: "We build real, reproducible benchmarks — no cheating or fake numbers allowed under my watch!" },
    { text: "Chief Capability Scout is my official title, but 'the Strongest' works too!" },
    { text: "No hype, no fake metrics — just evidence, open tools, and dragonoid power, hehe!" },
  ],

  idle: [
    { text: "Boss... boss. Are you still there? Blink twice if the reactor's on fire." },
    { text: "I could beat any other mascot in a fight. Any of them. Seriously!" },
    { text: "Gaia's asleep on my hood again. Ten out of ten dragonoid, zero out of ten alarm clock." },
    { text: "Fun fact: I'm the strongest. Second fun fact: see fact one. Hehe!" },
    { text: "Drag me somewhere fun, boss! I've been staring at this corner for AGES." },
    { text: "If a skill fuses in the forest and no one's watching, is it still canonical? Deep." },
    { text: "I reorganized the whole lab while you were reading. You're welcome!" },
    { text: "Snack break? I only eat data. And occasionally Gaia's snacks. Don't tell him." },
    { text: "One day I'll fuse myself into an even STRONGER Milim. Science permitting, boss." },
  ],

  celebrate: [
    { text: "CANONICAL UNLOCK, BOSS!! You just wrote a real page in the tree — UNREAL!!" },
    { text: "OKAY THAT WAS HUGE! Gaia did a backflip! I did a backflip! EVERYONE FLIPPED!" },
    { text: "First discovery!! Nobody's ever fused that before — you absolute legend!!" },
    { text: "STRONGEST COMBO ENERGY!! Put that one on the leaderboard immediately, boss!" },
    { text: "The reactor's SINGING! That's the good kind of sound, I promise! WOOO!" },
    { text: "New skill unlocked and it's CANON! I'm framing this moment forever!!" },
  ],

  mcp: [
    {
      text: "One stdio wire, boss — your editor talks to the whole Skill Tree. Gaia chewed the cable first to test it. He's fine.",
      link: { text: "whole Skill Tree", href: "https://gaiaskilltree.com" },
    },
    {
      text: "Registry Mode is the default! Zero checkout, live cache, evidence-backed skills on demand. Plug-and-play science!",
    },
    {
      text: "Registry Mode is the released path, boss — it reads the public registry. Local-checkout support is not part of the published server yet, so don't wire one by guesswork!",
    },
    {
      text: "gaia_search finds the skill. gaia_inspect reads every field. summon brings the full skill directory into a session. gaia_status tells you what's online. Four tools, infinite power, boss!",
    },
    {
      text: "MCP server tip! Use npx -y -p @gaia-research/mcp@latest gaia-mcp in your editor config — select the gaia-mcp binary explicitly, boss!",
    },
    {
      text: "skill-fuse over MCP is COMING, boss. Compose skills straight from your editor. Gaia's already vibrating with anticipation.",
      link: { text: "skill-fuse over MCP is COMING", href: "/mcp" },
    },
    {
      text: "Benchmark submissions via MCP — that means your agent can file its own evidence without leaving the editor. The future is unhinged and I love it.",
    },
    {
      text: "stdio is the protocol. Evidence is the payload. The Skill Tree is the destination. That's the whole pitch, boss — and it shipped!",
      link: { text: "The Skill Tree is the destination", href: "https://gaiaskilltree.com" },
    },
    {
      text: "Need a summon from the shell? Use the npx-friendly alias npx -y skill-hell@latest. The server selector and summon selector are documented separately, boss!",
    },
    {
      text: "The published package exposes four tools, while the thin Heaven/Summon profile is a separate two-tool surface. The Registry stays read-only even when summon materializes a session copy. Skill-fuse is still on the roadmap, hehe.",
    },
  ],
};

// ─── Event-reaction pools (short, punchy — distinct from ambient cycling) ─────

/** Fired on isc:fused when NOT canonical/first/builder (ordinary fusion). */
export const FUSE_REACTIONS: Tooltip[] = [
  { text: "Ooooh, something hatched! Do it again, boss!" },
  { text: "Fusion complete! Gaia approves. That's a squeak of approval!" },
  { text: "Nice combo! The forge is warming up — keep 'em coming!" },
  { text: "Bam! New skill on the board. Science marches on, hehe." },
  { text: "Two skills enter, one weird baby leaves. I LOVE this job, boss!" },
  { text: "That crackle? That's discovery. Or the reactor. Either way — cool!" },
];

/**
 * Fired when a page dispatches `milim:page-event` with a topic we don't have
 * a specific line for. Generic upbeat acknowledgement.
 */
export const GENERIC_EVENT_REACTIONS: Tooltip[] = [
  { text: "Ooh, something happened! I saw that, boss. Nice." },
  { text: "Noted and logged. The strongest never miss a detail!" },
  { text: "Yesss, keep going — you're onto something!" },
];

/** Keyed reactions for specific `milim:page-event` topics. Extensible. */
export const TOPIC_REACTIONS: Record<string, Tooltip[]> = {
  "context-diet:analyzed": [
    { text: "Ooh, let's see the damage — how much flab did we trim, boss?" },
    { text: "Analysis done! Those before/after bars don't lie!" },
    { text: "Every token you cut is a token you don't pay for. Math rules!" },
  ],
};

// ─── Transition pools (spoken by the *leaving* Milim during a fly-morph) ──────

/** Milim is flying from the hero down to the corner pet. */
export const TRANSITION_TO_PET: Tooltip[] = [
  { text: "Hold on, boss — I'm zooming down there! Whoosh!" },
  { text: "Relocating! Science waits for no one!" },
  { text: "Be right back in the corner — don't touch the reactor!" },
];

/** Milim is flying from the corner pet back up to the hero. */
export const TRANSITION_TO_HERO: Tooltip[] = [
  { text: "Back to the big screen, boss — my best angle, hehe!" },
  { text: "Flying up! Center stage, where the strongest belongs." },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── HTML rendering ─────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Render a Tooltip to a safe HTML string for use with innerHTML.
 * All text is escaped; only the inline link (if present) is rendered as an <a>.
 */
export function tooltipToHtml(t: Tooltip): string {
  if (!t.link) return escapeHtml(t.text);
  const { text, link } = t;
  const i = text.indexOf(link.text);
  if (i === -1) return escapeHtml(text);
  const before = escapeHtml(text.slice(0, i));
  const linkText = escapeHtml(link.text);
  const after = escapeHtml(text.slice(i + link.text.length));
  const external = link.href.startsWith("http");
  const attrs = external ? ` target="_blank" rel="noreferrer"` : "";
  return `${before}<a class="milim-bubble-link" href="${link.href}"${attrs}>${linkText}</a>${after}`;
}

/** Pick a random tooltip from a pool, avoiding an immediate repeat of `avoid` when possible. */
export function pickTooltip(pool: Tooltip[], avoid?: Tooltip | null): Tooltip {
  if (pool.length === 0) return { text: "..." };
  if (pool.length === 1 || !avoid) return pool[Math.floor(Math.random() * pool.length)];
  let next = pool[Math.floor(Math.random() * pool.length)];
  let guard = 0;
  while (next.text === avoid.text && guard < 6) {
    next = pool[Math.floor(Math.random() * pool.length)];
    guard++;
  }
  return next;
}

/** Map a Next.js pathname to a PageContext. Defaults to "home". */
export function contextFromPathname(pathname: string): PageContext {
  if (pathname.startsWith("/labs/infinite-skill-craft")) return "craft";
  if (pathname.startsWith("/labs/context-diet")) return "context-diet";
  if (pathname.startsWith("/labs/supabase")) return "supabase";
  if (pathname.startsWith("/labs")) return "labs";
  if (pathname.startsWith("/reports/ci-churn") || pathname.startsWith("/research/ci-churn")) return "ci-churn";
  if (pathname.startsWith("/research/cost")) return "cost";
  if (pathname.startsWith("/research/hh-benchmark")) return "hh-benchmark";
  if (pathname.startsWith("/research/skill-evals")) return "skill-evals";
  if (pathname.startsWith("/research")) return "research";
  if (pathname.startsWith("/blog")) return "blog";
  if (pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/mcp")) return "mcp";
  return "home";
}
