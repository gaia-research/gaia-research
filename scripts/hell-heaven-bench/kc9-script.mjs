// KC9 — the demo's script and camera plan, in one place.
//
// ONE STRING PER BEAT. `say` is the authored line. The narrator sends it to
// the voice model as written; the caption is `say` with the performance tags
// mechanically stripped. So the two can differ in *performance* but never in
// *content* — there is no second copy of the words to fall out of date, and
// the caption stays an exact transcript of what is spoken. It doubles as the
// text alternative for a viewer who cannot hear the audio.
//
// PERFORMANCE TAGS. `[excited]`, `[curious]`, `[mischievously]` are direction
// for ElevenLabs' v3 model, not words. Only those three are used: they were
// checked against this voice before the full take, and an unrecognised tag
// risks being read aloud as literal text.
//
// EVERY FIGURE IS INTERPOLATED FROM THE TRANSCRIPT. There is no number typed
// into this file. A line that states a token count states the committed
// record's token count by construction — the same discipline the replay page
// and the report hold themselves to.
//
// VOICE: Milim Nova, per `marketing-tasks/MILIM.md` — short energetic
// sentences, evidence first, "boss" when addressing the viewer, asides used
// sparingly. The guardrail that matters most here is MILIM.md's own: *the
// sparkle must never replace the evidence*, and never invent a metric. So the
// swagger sits in the verbs and the framing, never in the numbers.
//
// TIMING IS NOT IN THIS FILE. Each cue declares `gapMs` — the pause AFTER its
// line — and the absolute start times are derived from the real audio
// durations by `narrate-kc9.mjs`. That way the narration track is, by
// construction, line + gap + line + gap …, and the captions cannot drift out
// of sync with the voice no matter how long a take runs.

const num = (x) => Number(x).toLocaleString("en-US");

// The transcript records the harness as name "claude" / version
// "2.1.220 (Claude Code)". Spoken aloud, "vanilla claude" reads as a shrug;
// the product name is in the parenthetical, so take it from there rather than
// typing it and risking a line that lies if the harness ever changes.
const harnessName = (h) => (h.version.match(/\(([^)]+)\)/) || [, h.name])[1];

// The caption is the spoken line minus its performance direction. One regex,
// one direction — a caption can never say something the voice does not.
export const caption = (say) => say.replace(/\[[^\]]*\]/g, " ").replace(/\s+/g, " ").trim();

// Rough stand-in used only when no narration manifest exists yet, so the page
// still plays (silent, captioned) before anyone has spent an API credit.
// ~2.6 words/second is a brisk read; it is an estimate and is labelled as one.
export function estimateMs(text) {
  return Math.max(1800, Math.round((caption(text).split(/\s+/).length / 2.6) * 1000));
}

/**
 * Build the demo's cue list from the transcript beats.
 * @param {object} t  { native, floor, curated, beats, derived }
 */
export function buildCues(t) {
  const { native, floor, curated, derived } = t;
  const P = ["p-prompt", "p-endpoint"];

  return [
    // --- the hook: strongest claim first, per MILIM.md ---------------------
    { id: "hook", stage: "setup", step: 0, shown: [], focus: null, gapMs: 650,
      say: "[excited] Your context bloat is not mysterious, boss. It is measurable. And I measured it." },

    { id: "design", stage: "setup", step: 0, shown: [], focus: null, gapMs: 550,
      say: "One task. Three loadouts. [curious] Same prompt every time, down to the byte. Same pass-fail test. Only the loadout changes." },

    { id: "task", stage: "setup", step: 0, shown: ["p-prompt"], focus: "p-prompt", gapMs: 550,
      say: "Here is the task. A teammate proposes a side-border on a card. [curious] Does any skill you have actually name that as an anti-pattern it must refuse?" },

    { id: "trick", stage: "setup", step: 0, shown: ["p-prompt"], focus: "p-prompt", gapMs: 700,
      say: "[mischievously] The answer is a term coined by exactly one skill contract. And it is not in the prompt. Guessing does not pass. Heh." },

    { id: "endpoint", stage: "setup", step: 0, shown: P, focus: "p-endpoint", gapMs: 650,
      say: "One endpoint. Identical on all three arms. It is the task, not a per-arm goalpost. [mischievously] Nobody moves goalposts on my watch." },

    { id: "arm1", stage: "setup", step: 0, shown: P, focus: null, gapMs: 450,
      say: `[curious] Arm one: ${native.label}. Vanilla ${harnessName(native.harness)}, hauling this workstation's entire default loadout.` },

    // --- beat 1: native ----------------------------------------------------
    { id: "native-reply", stage: "replay", step: 1, shown: P, focus: "beat1", gapMs: 550,
      say: `One turn. One answer. ${native.reply}. It cannot name the thing.` },

    { id: "native-cost", stage: "replay", step: 1, shown: P, focus: "beat1", gapMs: 650,
      say: `And it paid ${num(native.tokens.perTurn)} per-turn tokens for a loadout that did not hold the one contract this task needed.` },

    { id: "native-fair", stage: "replay", step: 1, shown: P, focus: "beat1", gapMs: 750,
      say: "It is not wrong, though. It answers correctly for what it has. I keep my claims narrow. They hit harder that way." },

    { id: "arm2", stage: "replay", step: 1, shown: P, focus: null, gapMs: 450,
      say: `Arm two: the ${floor.label}. [curious] Every door shut. Zero skills.` },

    // --- beat 2: floor, then the subtraction -------------------------------
    { id: "floor-reply", stage: "replay", step: 2, shown: P, focus: "beat2", gapMs: 550,
      say: `The ${floor.label} answers in a sentence, not the contract format. Same endpoint. Same failure.` },

    { id: "floor-negative", stage: "replay", step: 2, shown: P, focus: "beat2", gapMs: 750,
      say: `${num(floor.tokens.perTurn)} tokens. [excited] And a verified negative. With no skills there is no term to name, so the model says so instead of inventing one. That is the good kind of failure.` },

    { id: "bloat", stage: "replay", step: 2, shown: P, focus: "bloat", emphasis: "bloat", gapMs: 850,
      say: `[excited] Now subtract. ${num(derived.bloat)} tokens of standing context. [mischievously] Both arms failed — one just paid ${num(derived.bloat)} more to fail.` },

    { id: "bloat-proof", stage: "replay", step: 2, shown: P, focus: "bloat", emphasis: "bloat", gapMs: 750,
      say: "Tiny chaos detected. And it is not rhetoric — that is a subtraction between two live runs, gated identically." },

    { id: "arm3", stage: "replay", step: 2, shown: P, focus: null, gapMs: 450,
      say: `[excited] Arm three: ${curated.label}. One skill. The one that actually holds the contract.` },

    // --- beat 3: curated, the payoff ---------------------------------------
    { id: "curated-open", stage: "replay", step: 3, shown: P, focus: "beat3", gapMs: 450,
      say: `${num(curated.tokens.skillStanding)} tokens of standing listing. It opens that one contract, reads it, and answers.` },

    { id: "curated-pass", stage: "replay", step: 3, shown: P, focus: "beat3-reply", gapMs: 850,
      say: `[excited] ${curated.reply}. The coined term, exactly as the contract writes it. Endpoint passes.` },

    { id: "curated-honest", stage: "replay", step: 3, shown: P, focus: "beat3", gapMs: 750,
      say: `Its ${num(curated.tokens.perTurn)} per-turn includes the skill body being read during the run. That is work done, not weight carried. I will not fudge it for a prettier story.` },

    // --- verdict -----------------------------------------------------------
    { id: "verdict", stage: "verdict", step: 3, shown: P, focus: "table", gapMs: 650,
      say: "Biggest loadout: failed. Smallest loadout: failed. [excited] The chosen one passed." },

    { id: "clock", stage: "verdict", step: 3, shown: P, focus: "table", gapMs: 550,
      say: `All three arms cost ${num(derived.totalWallMs)} milliseconds. [mischievously] The three minutes was me explaining.` },

    { id: "close", stage: "verdict", step: 3, shown: P, focus: null, gapMs: 1500,
      say: "Every figure here is read from the run transcript. The double-dagger marks the one pole measured but never committed. [excited] Now go pick your own loadout and make it undeniable. Your move, boss." },
  ];
}

/**
 * Turn cues + per-line durations into an absolute timeline.
 * The narration track is line + gap + line + gap …, so `at` is a running sum
 * and the captions cannot drift from the voice.
 * @param {Array} cues
 * @param {Record<string, number>|null} durations  id -> ms of real audio
 */
export function layout(cues, durations) {
  let t = 0;
  const timeline = cues.map((c) => {
    const dur = durations?.[c.id] ?? estimateMs(c.say);
    const cue = { ...c, at: t, durMs: dur, cap: caption(c.say) };
    t += dur + c.gapMs;
    return cue;
  });
  return { timeline, endMs: t };
}
