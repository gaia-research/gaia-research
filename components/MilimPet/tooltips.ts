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
  | "research"
  | "idle"
  | "celebrate";

// ─── Tooltip pools ────────────────────────────────────────────────────────────

export const TOOLTIPS: Record<PageContext, Tooltip[]> = {
  home: [
    { text: "Welcome to the lab, boss! I'm Milim — strongest researcher, obviously." },
    { text: "Gaia and I run this whole place. Poke around, don't break the reactor!" },
    { text: "Every claim here links to receipts. Evidence or it didn't happen — golly, I love that." },
    { text: "New to Gaia? Start with the ledger below. It's where the real gossip lives." },
    { text: "Psst — the Skill Tree is the big map.", link: { text: "the Skill Tree", href: "https://gaiaskilltree.com" } },
    { text: "Wanna play instead of read? Go smash some skills together in the craft lab, boss!" },
    { text: "I benchmarked myself once. Result: strongest. Peer review pending, hehe." },
    { text: "Gaia says hi. That was a squeak. He's shy but he's a No. 1 dragonoid, gosh." },
  ],

  labs: [
    { text: "Pick your poison, boss! Two labs, zero rules, maximum chaos." },
    { text: "Craft lab = fuse skills and watch stuff hatch. Diet lab = shrink your context. Easy!" },
    { text: "Everything here runs in YOUR browser. No uploads, no snooping — Milim's honor." },
    { text: "Golly, so many buttons. Press them all, that's the scientific method!" },
    { text: "These are toys with teeth. Real benchmarks get published after review, boss." },
    { text: "Can't decide? Flip a coin. Or ask Gaia — he always picks the fusion game." },
    { text: "Labs are where hypotheses come to get bullied into evidence. Let's go!" },
  ],

  craft: [
    { text: "Drag two skills together and BAM — something hatches, boss!" },
    { text: "Canonical unlocks are the real deal — they link straight into the tree.", link: { text: "the tree", href: "https://gaiaskilltree.com" } },
    { text: "Weird combos make weird skills. That's not a bug, that's discovery, gosh!" },
    { text: "Stuck? Try fusing a base skill with itself. Chaos loves a mirror." },
    { text: "Fresh out of ideas? Reset the canvas and go feral again.", link: { text: "go feral again", href: "/labs/infinite-skill-craft" } },
    { text: "First to discover a combo gets the glory. Beat the other builders, boss!" },
    { text: "Gaia ate a curse skill once. He was FINE. Mostly. Don't tell anyone." },
    { text: "Every canonical result is a real page someone can build on. Big deal, golly!" },
  ],

  "context-diet": [
    { text: "Paste your bloated context, boss — let's put it on a diet!" },
    { text: "Half your tokens are probably filler. Trim 'em, save the budget, gosh." },
    { text: "See the before/after bars? That gap is pure money you're not spending." },
    { text: "The full benchmark is on GitHub if you want the receipts.", link: { text: "on GitHub", href: "https://github.com/gaia-research" } },
    { text: "Rank your run on the leaderboard — beat the compression high score, boss!", link: { text: "the leaderboard", href: "/labs/context-diet" } },
    { text: "Rule of thumb: if a line doesn't change the answer, it's dead weight." },
    { text: "Smaller context = faster, cheaper, sharper agents. Golly, it's basically free wins." },
    { text: "Your text never leaves the browser. I only judge it silently, hehe." },
  ],

  research: [
    { text: "This is the ledger, boss. Every entry earned its spot with evidence." },
    { text: "We observe, benchmark, verify, publish. Vibes are NOT a methodology, gosh." },
    { text: "Postmortems are just victory laps for problems we already crushed." },
    { text: "Read the CI churn one — flaky pipelines cost more than you'd think, golly." },
    { text: "Every number here has a receipt. Click through, trust nothing, verify everything!" },
    { text: "Frontier work is messy. We publish the mess AND the fix, boss. That's the deal." },
    { text: "Cost research? Yeah, I count tokens for fun. Strongest AND thrifty, hehe." },
  ],

  idle: [
    { text: "Boss... boss. Are you still there? Blink twice if the reactor's on fire." },
    { text: "I could beat any other mascot in a fight. Any of them. Gosh, I'm bored." },
    { text: "Gaia's asleep on my hood again. Ten out of ten dragonoid, zero out of ten alarm clock." },
    { text: "Fun fact: I'm the strongest. Second fun fact: see fact one. Hehe!" },
    { text: "Drag me somewhere fun, boss! I've been staring at this corner for AGES." },
    { text: "If a skill fuses in the forest and no one's watching, is it still canonical? Deep." },
    { text: "I reorganized the whole lab while you were reading. You're welcome, golly." },
    { text: "Snack break? I only eat data. And occasionally Gaia's snacks. Don't tell him." },
    { text: "One day I'll fuse myself into an even STRONGER Milim. Science permitting, boss." },
  ],

  celebrate: [
    { text: "CANONICAL UNLOCK, BOSS!! You just wrote a real page in the tree — GOSH!!" },
    { text: "OKAY THAT WAS HUGE! Gaia did a backflip! I did a backflip! EVERYONE FLIPPED!" },
    { text: "First discovery!! Nobody's ever fused that before — you absolute legend, golly!!" },
    { text: "STRONGEST COMBO ENERGY!! Put that one on the leaderboard immediately, boss!" },
    { text: "The reactor's SINGING! That's the good kind of sound, I promise! WOOO!" },
    { text: "New skill unlocked and it's CANON! I'm framing this moment forever, gosh!!" },
  ],
};

// ─── Event-reaction pools (short, punchy — distinct from ambient cycling) ─────

/** Fired on isc:fused when NOT canonical/first/builder (ordinary fusion). */
export const FUSE_REACTIONS: Tooltip[] = [
  { text: "Ooooh, something hatched! Do it again, boss!" },
  { text: "Fusion complete! Gaia approves. That's a squeak of approval, gosh." },
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
  { text: "Noted and logged. The strongest never miss a detail, gosh." },
  { text: "Yesss, keep going — you're onto something!" },
];

/** Keyed reactions for specific `milim:page-event` topics. Extensible. */
export const TOPIC_REACTIONS: Record<string, Tooltip[]> = {
  "context-diet:analyzed": [
    { text: "Ooh, let's see the damage — how much flab did we trim, boss?" },
    { text: "Analysis done! Those before/after bars don't lie, gosh." },
    { text: "Every token you cut is a token you don't pay for. Golly, math!" },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  if (pathname.startsWith("/labs")) return "labs";
  if (pathname.startsWith("/research")) return "research";
  return "home";
}
