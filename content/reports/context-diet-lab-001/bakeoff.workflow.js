export const meta = {
  name: 'context-diet-bakeoff',
  description: 'Context Diet Lab 001: bake off 4 CLAUDE.md compaction strategies, adversarially score faithfulness, pick winner',
  phases: [
    { title: 'Inventory', detail: 'extract ground-truth rule list from original' },
    { title: 'Compact', detail: '4 candidate strategies in parallel' },
    { title: 'Verify', detail: 'adversarial faithfulness scoring per candidate' },
    { title: 'Score', detail: 'gate on <40k, rank by faithfulness' },
  ],
}

const ROOT = '/c/Users/C5396183/gaia-skill-tree/.claude/worktrees/context-diet-lab-001'
const CLAUDE = ROOT + '/CLAUDE.md'
const CAND = ROOT + '/tools/context-diet/candidates'
const LIMIT = 40000
const TARGET = 34000

// Shared constraints every compaction agent must honor.
const CONSTRAINTS = `
HARD CONSTRAINTS (from the file itself — violating any is an automatic fail):
- NO RULE MAY BE LOST. Every directive, invariant, exemption, allowlist entry, incident-codified
  rule, table row, and enforced constraint in the original must remain RECOVERABLE from the result.
- These sections must stay FULLY INLINE, verbatim or near-verbatim (they are frequently-hit,
  CI-enforced invariants): "Redaction Exemptions" (the 8 handles + how-to-add), all "Branch Scope"
  allowlists, "Programmatic-First Policy" + its CLI Pre-Flight Rule, "Authorization — Verifier
  Guardrail", "Generated Artifacts — Class P vs Class S", "Versioning" decorative-asset hard rule.
- Preserve exact literals: handle names, file paths, CLI command syntax, CSS values (5rem/6rem/8rem,
  ~58px), version numbers, workflow/label names, the 40.0k-char figure.
- Result must be valid GitHub-flavored Markdown, same top-level heading structure where kept.
- Target: under ${TARGET} chars (hard ceiling ${LIMIT}). Report the exact char count you achieved.
`

phase('Inventory')
// The scientific control: an atomic, checkable list of every rule in the original.
const INV_SCHEMA = {
  type: 'object',
  required: ['rules'],
  properties: {
    rules: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'section', 'rule', 'loadBearing'],
        properties: {
          id: { type: 'string', description: 'stable slug e.g. redaction-8-handles' },
          section: { type: 'string' },
          rule: { type: 'string', description: 'one atomic directive, testable presence' },
          loadBearing: { type: 'boolean', description: 'true if CI-enforced or incident-codified' },
        },
      },
    },
  },
}
const inventory = await agent(
  `Read ${CLAUDE} in full. Extract an EXHAUSTIVE inventory of every atomic rule/directive/invariant/
exemption/allowlist-entry it contains — the kind of thing that, if silently dropped, would let an
agent ship a state that breaks CI or violates a codified convention. Aim for completeness over
brevity (expect 60-120 rules). Each rule = one testable assertion. Mark loadBearing=true for
CI-enforced or incident-codified rules (redaction exemptions, branch scope, Class P/S, authorization,
versioning hard rules, nav/footer guard, etc.). Return the full list.`,
  { schema: INV_SCHEMA, phase: 'Inventory', effort: 'high' }
)
const totalRules = inventory.rules.length
const loadBearing = inventory.rules.filter(r => r.loadBearing)
log(`Rule inventory: ${totalRules} rules (${loadBearing.length} load-bearing)`)

// Strategy definitions.
const STRATEGIES = [
  {
    key: 'externalize',
    title: 'Externalize + link',
    instructions: `Move the LARGEST detailed playbook sections (candidates: "Fixed-nav clearance",
"Known Badges Issues", "Known Skill Explorer Issues", "Deferred-surface convention", "Curation
Guidelines", and any other verbose how-to section) OUT of CLAUDE.md into separate reference files
under docs/agents/. In CLAUDE.md, replace each moved section with a SHORT STUB: the one-sentence
load-bearing invariant that must stay top-of-mind PLUS a "See docs/agents/<file>.md" pointer.
This mirrors the repo's existing pattern (docs/agents/issue-tracker.md etc.). The moved detail is
NOT lost — it lives in the linked file. Produce BOTH the trimmed CLAUDE.md AND the full text of each
new docs/agents/*.md file. Keep the do-not-touch sections fully inline.`,
  },
  {
    key: 'condense',
    title: 'Condense in place',
    instructions: `Do NOT create new files. Rewrite verbose sections tighter IN PLACE: strip retro
backstory, incident anecdotes ("codified after the 2026-XX-XX review where…"), redundant restatement,
and prose padding — while keeping EVERY actual rule. Convert narrative paragraphs to terse bullet
directives. Keep the do-not-touch sections fully inline (you may still trim their anecdote prose but
not their rules/literals).`,
  },
  {
    key: 'caveman',
    title: 'Telegraphic / caveman',
    instructions: `Aggressive token-chunking. Rewrite ALL non-load-bearing prose into ultra-terse
telegraphic imperatives: drop articles/filler, use "→", ":", and fragments. e.g.
"When the user asks for a specific task, stay focused on that task. Do NOT deviate into debugging"
becomes "Task asked → do that task only. No unrequested debugging/exploration." Preserve every rule
and every exact literal (paths, handles, CSS values, commands). Do-not-touch sections: keep their
literals and rules exact, but their surrounding prose may be telegraphed. This tests how far pure
lexical compression goes before faithfulness breaks.`,
  },
  {
    key: 'hybrid',
    title: 'Hybrid route',
    instructions: `Combine strategies by routing each section to its best treatment: EXTERNALIZE the
top 3 largest playbooks to docs/agents/*.md (stub + invariant + link), CONDENSE mid-size narrative
sections in place (strip anecdotes, bullet-ify), and leave the do-not-touch CI-enforced sections
fully inline & verbatim. Produce the trimmed CLAUDE.md AND the full text of each new docs/agents/*.md.
Optimize for max faithfulness at target size.`,
  },
]

// Proxy caps concurrent Opus instances. Run agents in fixed-size batches
// (2 at a time) instead of firing all candidates at once. parallel() is a
// barrier over each slice, so a slice of 2 = concurrency 2. Completed agents
// bank to journal.jsonl the instant they finish, so a batch that finishes is
// never lost even if a later batch is interrupted.
async function runInBatches(thunks, size) {
  const out = []
  for (let i = 0; i < thunks.length; i += size) {
    const res = await parallel(thunks.slice(i, i + size))
    out.push(...res)
  }
  return out
}
const BATCH = 2

phase('Compact')
// Stage 1: produce each compacted artifact — batched 2-at-a-time, all Opus.
// Prompt + opts kept byte-identical to the original run so cached candidates
// (inventory, externalize) replay instantly on resume.
const compactThunks = STRATEGIES.map((strat) => () => agent(
    `You are compacting an oversized agent-context file for the "${strat.title}" strategy in the
Context Diet Lab 001 bake-off.

Read ${CLAUDE} in full (${'49,687'} chars, ${totalRules} rules, over the ${LIMIT}-char limit).

STRATEGY — ${strat.title}:
${strat.instructions}
${CONSTRAINTS}

Return the COMPLETE new CLAUDE.md text and any new docs/agents files.`,
    {
      label: `compact:${strat.key}`,
      phase: 'Compact',
      effort: 'high',
      schema: {
        type: 'object',
        required: ['claudeMd', 'newFiles', 'charCount', 'approach'],
        properties: {
          claudeMd: { type: 'string', description: 'full trimmed CLAUDE.md text' },
          newFiles: {
            type: 'array',
            description: 'new docs/agents files created (empty for in-place strategies)',
            items: {
              type: 'object',
              required: ['path', 'content'],
              properties: {
                path: { type: 'string', description: 'e.g. docs/agents/fixed-nav-clearance.md' },
                content: { type: 'string' },
              },
            },
          },
          charCount: { type: 'integer', description: 'len(claudeMd) you produced' },
          approach: { type: 'string', description: '2-3 sentence summary of what you did' },
        },
      },
    }
  ).then(out => ({ strat, out })))
const compacted = await runInBatches(compactThunks, BATCH)
log(`Compaction done: ${compacted.filter(Boolean).length}/${STRATEGIES.length} candidates produced`)

phase('Verify')
// Stage 2: adversarial faithfulness verification — a SEPARATE batched pass so
// verify-Opus calls never stack on top of compact-Opus calls. Also 2-at-a-time.
const verifyThunks = compacted.map((prev) => () => {
    if (!prev || !prev.out) return Promise.resolve(null)
    const { strat, out } = prev
    const actualChars = (out.claudeMd || '').length
    // Serialize the full candidate corpus (CLAUDE.md + linked files) for the refuter.
    const corpus = [`===== CLAUDE.md (${actualChars} chars) =====`, out.claudeMd]
      .concat((out.newFiles || []).flatMap(f => [`===== ${f.path} =====`, f.content]))
      .join('\n')
    const ruleList = inventory.rules
      .map(r => `[${r.id}]${r.loadBearing ? '★' : ' '} (${r.section}) ${r.rule}`)
      .join('\n')
    return agent(
      `You are an ADVERSARIAL faithfulness auditor for the Context Diet bake-off. Your job is to find
rules that were DROPPED or WEAKENED by the "${strat.title}" compaction. Be skeptical: default to
"missing" if a rule's substance is not clearly recoverable from the candidate corpus below (CLAUDE.md
PLUS any linked docs/agents files — a rule moved to a linked file COUNTS AS PRESENT).

GROUND-TRUTH RULE INVENTORY (★ = load-bearing):
${ruleList}

CANDIDATE CORPUS:
${corpus}

For EACH rule id, decide: present (substance recoverable from corpus), weakened (present but a literal
or nuance lost), or missing (dropped). Return counts and the list of any weakened/missing rule ids
with a one-line reason. A single missing load-bearing rule is a critical failure.`,
      {
        label: `verify:${strat.key}`,
        phase: 'Verify',
        effort: 'high',
        schema: {
          type: 'object',
          required: ['presentCount', 'weakenedCount', 'missingCount', 'missingIds', 'weakenedIds', 'loadBearingMissing'],
          properties: {
            presentCount: { type: 'integer' },
            weakenedCount: { type: 'integer' },
            missingCount: { type: 'integer' },
            missingIds: { type: 'array', items: { type: 'string' } },
            weakenedIds: { type: 'array', items: { type: 'string' } },
            loadBearingMissing: { type: 'array', items: { type: 'string' },
              description: 'ids of load-bearing rules that are missing OR weakened' },
          },
        },
      }
    ).then(verdict => {
      const faithfulness = totalRules ? verdict.presentCount / totalRules : 0
      const underLimit = actualChars < LIMIT
      const underTarget = actualChars < TARGET
      const noLoadBearingLoss = (verdict.loadBearingMissing || []).length === 0
      // Disqualify if over hard limit OR any load-bearing rule lost.
      const qualified = underLimit && noLoadBearingLoss
      return {
        key: strat.key,
        title: strat.title,
        approach: out.approach,
        charCount: actualChars,
        reduction: 49687 - actualChars,
        reductionPct: +(((49687 - actualChars) / 49687) * 100).toFixed(1),
        underLimit,
        underTarget,
        faithfulness: +(faithfulness * 100).toFixed(1),
        presentCount: verdict.presentCount,
        weakenedCount: verdict.weakenedCount,
        missingCount: verdict.missingCount,
        loadBearingMissing: verdict.loadBearingMissing || [],
        missingIds: verdict.missingIds || [],
        weakenedIds: verdict.weakenedIds || [],
        qualified,
        newFileCount: (out.newFiles || []).length,
        // keep artifacts for the winner-apply phase
        _claudeMd: out.claudeMd,
        _newFiles: out.newFiles || [],
      }
    })
  })
const results = await runInBatches(verifyThunks, BATCH)

phase('Score')
const scored = results.filter(Boolean)
const qualified = scored.filter(r => r.qualified)
// Winner: qualified, then max faithfulness, tie-break on larger reduction.
const ranked = [...qualified].sort((a, b) =>
  b.faithfulness - a.faithfulness || b.reduction - a.reduction)
const winner = ranked[0] || null

for (const r of scored) {
  log(`${r.title}: ${r.charCount} chars (-${r.reductionPct}%), faithfulness ${r.faithfulness}%, ` +
      `LB-loss ${r.loadBearingMissing.length}, ${r.qualified ? 'QUALIFIED' : 'DISQUALIFIED'}`)
}
if (winner) log(`WINNER → ${winner.title} @ ${winner.charCount} chars, ${winner.faithfulness}% faithful`)

// Strip heavy artifacts from the comparison table; keep winner's full artifact separately.
const comparison = scored.map(({ _claudeMd, _newFiles, ...rest }) => rest)
return {
  inventory: { total: totalRules, loadBearing: loadBearing.length },
  originalChars: 49687,
  limit: LIMIT,
  target: TARGET,
  comparison,
  winnerKey: winner ? winner.key : null,
  winner: winner ? {
    key: winner.key, title: winner.title, charCount: winner.charCount,
    faithfulness: winner.faithfulness, reductionPct: winner.reductionPct,
    claudeMd: winner._claudeMd, newFiles: winner._newFiles,
  } : null,
}
