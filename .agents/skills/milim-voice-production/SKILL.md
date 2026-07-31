---
name: milim-voice-production
description: Produce Milim-voiced narration and voice-over with ElevenLabs TTS for Gaia Research — demo videos, walkthroughs, trailers, audio captions. Covers secure API-key rotation via .env.local, the ratified voice/model/settings contract, the performance-tag vocabulary, script authoring in MILIM.md's register, and the narrate → render → record pipeline where the audio track *is* the timeline. Use whenever an agent is asked to add narration, a voice-over, spoken captions, or a Milim read to any artifact in this repo.
---

# Milim Voice Production

Milim Nova speaks. This skill covers turning a script into a committed narration
track, and wiring that track to whatever it narrates.

**Reference implementation:** the KC9 three-minute demo —
`scripts/hell-heaven-bench/{kc9-script,narrate-kc9,record-kc9-video}.mjs`. Read
those before building a new pipeline; most of the work is already done there.

---

## 1. The API key — open it, never print it

**Default action when a key is needed, missing, or being rotated: open the file
for the user to edit. Do not ask them to paste a key into the conversation.**

```bash
open -e .env.local            # macOS; or: ${EDITOR:-vi} .env.local
```

The key lives at repo root in `.env.local`, gitignored by `.env*`:

```
ELEVENLABS_API_KEY=sk_...
```

**Rules, because keys here rotate often:**

- **Never emit the key into the transcript.** No `cat .env.local`, no
  `echo $ELEVENLABS_API_KEY`, no `grep` that lands the value in visible output.
  Tool output is logged and persists; a printed key is a leaked key.
- **Read it into a variable, use it in a header.** Never as a positional
  argument (argv is world-readable via `ps`):
  ```bash
  KEY=$(sed -n 's/^ *ELEVENLABS_API_KEY *= *//p' .env.local | tr -d "\"' ")
  curl -s -H "xi-api-key: $KEY" https://api.elevenlabs.io/v1/models
  ```
- **Verify without revealing.** Print a status code and a fingerprint, nothing else:
  ```bash
  curl -s -o /dev/null -w 'auth: %{http_code}\n' -H "xi-api-key: $KEY" \
    https://api.elevenlabs.io/v1/user/subscription
  printf 'key ...%s (len %s)\n' "${KEY: -4}" "${#KEY}"
  ```
  `200` is good; `401` means the key is wrong or revoked — offer to open
  `.env.local`, do not guess.
- **If a key ever appears in chat, in a commit, or in command output, it is
  burned.** Say so plainly and tell the user to revoke it at
  elevenlabs.io → Profile → API Keys. Do not keep using it.
- **Never commit `.env.local`.** It is gitignored; confirm with
  `git check-ignore -v .env.local` if you have any doubt.

Scripts should resolve the key as: `process.env.ELEVENLABS_API_KEY` first, then
`.env.local`. That way a shell export works for one-off runs without editing
the file, and CI can inject a secret without either.

---

## 2. The voice contract

| | Value | Why |
|---|---|---|
| Voice ID | `0mEHhncrwNcxHPYG8b63` — **"Little Dragon Girl V2"** | The owner's current custom Milim voice. Do not substitute a stock voice. Supersedes `d8x5JlMZFAGFxrfm0WkG` ("Little Dragon girl"), which was a prototype. |
| Model | `eleven_v3` | The only current model that honours inline performance tags. `eleven_multilingual_v2` reads the same lines flat and noticeably **older** — rejected by the owner on 2026-07-31 for exactly that. |
| `stability` | `0.5` (Natural) | Owner's call for the V2 voice, 2026-07-31. The tags still land, but the read stops swinging between takes — which matters across 20+ lines that must sound like one person in one sitting. `0.0` (Creative) has more range and less consistency. |
| `similarity_boost` | `0.75` | |

Overridable per run via `VOICE_ID` / `MODEL_ID` / `STABILITY` env vars, so a
candidate comparison never requires editing the script.

`eleven_v3` does **not** accept `style` / `use_speaker_boost` / `speed` — those
are `eleven_multilingual_v2` parameters. Sending them is a silent no-op at best.

**Performance tags — verified set only:**

`[excited]` · `[curious]` · `[mischievously]`

These three were checked against this voice before a full take. **An
unrecognised tag risks being read aloud as a literal word**, which ruins a line
and costs a re-generation. Before using any tag outside this set, synthesise
one short line with it and listen — then add it here with the date.

---

## 3. The script must sound like Milim

**Source of truth: `../marketing-tasks/MILIM.md`** (sibling repo — read it if
the checkout exists). It is not present in a fresh clone or in CI, so the
essentials are restated here and this skill stands alone without it:

- Short, energetic sentences. Vivid verbs. Confident rhythm.
- **Evidence first.** Lead with the strongest claim or the useful fact.
- Address the viewer as **"boss"**.
- Asides, used sparingly: "Heh." · "Behold!" · "Tiny chaos detected." ·
  "Your move, boss."
- Close on a dare, not an obligation.
- **Never**: corporate register, baby-talk, anime references, "revolutionary" /
  "seamless" / "empower", or piled-up exclamation marks.
- **The guardrail that outranks the rest:** *the sparkle must never replace the
  evidence, and never invent a metric.* Put the swagger in the verbs and the
  framing — never in the numbers.

### Numbers are interpolated, never typed

Any figure a line states must be read out of the artifact it describes
(a transcript, a ledger record, a census field) at build time:

```js
say: `And it paid ${num(native.tokens.perTurn)} per-turn tokens for a loadout …`
```

A narration that states a number the records do not is the same
provenance-overclaim failure `check-claims.ts` exists to catch — and audio is
worse, because a gate cannot read it. Interpolation makes the claim true by
construction.

### One authored string; the caption is derived

Write the line **once**, with its tags. Derive the on-screen caption by
stripping them:

```js
export const caption = (say) => say.replace(/\[[^\]]*\]/g, " ").replace(/\s+/g, " ").trim();
```

One regex, one direction. The spoken and shown text then differ in
*performance* but never in *content*, there is no second copy to fall out of
date, and the caption is an exact transcript of the audio — which is also the
text alternative that makes the video accessible. Record both the sent text and
the derived caption in the manifest so the stripping is auditable.

---

## 4. The audio *is* the timeline

Do not hand-align captions to a voice track. Synthesise each line separately,
then assemble `line + silence(gap) + line + silence(gap) …`. The start time of
line *N* is then, by construction, the running sum of everything before it.

```
narrate → manifest {id, text, caption, durationMs, gapMs, at, sha256}
        → renderer bakes `at` into the page
        → recorder muxes the track
```

Nothing is offset by hand, so nothing can drift — however long a take runs.
Change a line, re-narrate, re-render: the timeline re-derives itself.

**Commit the assembled track and the manifest. Do not commit per-line audio.**
That keeps the artifact rebuildable from committed inputs *with no API key*,
while the manifest records exactly what was said and how long it ran. TTS is
not deterministic: a re-take yields a different read, new durations, and a new
self-consistent timeline — which is precisely why durations are committed
rather than assumed.

---

## 5. Spend discipline

v3 costs credits per generation, and a 20-line script re-run on a whim is real
money. In order:

1. **`--dry-run` first.** Lay out pacing and total runtime from a word-rate
   estimate. No API calls. Fix the script here.
2. **Sample 3–4 lines**, not the whole script — the hook, one mid beat, the
   payoff, the close. Send them to the user and **wait**. Voice is subjective;
   the owner's ear decides, not yours.
3. **Then the full take.**
4. Re-render and re-record only after the take is approved.

Never regenerate the whole script to fix one line — the pipeline is per-line by
design; regenerate the line and re-assemble.

---

## 6. Before you call it done

- [ ] No tag was read aloud as a word (listen, or have the owner confirm).
- [ ] Every caption is bracket-free: `cues.filter(c => /[\[\]]/.test(caption(c.say)))` is empty.
- [ ] Every figure in the narration traces to the artifact it describes.
- [ ] The track and manifest are committed; per-line audio is not.
- [ ] `.env.local` is untracked and the key never entered the transcript.
- [ ] Runtime is what was promised (a "three-minute demo" should be ~3 minutes).
- [ ] Anything the audio asserts is also on screen, so a muted viewer loses nothing.
