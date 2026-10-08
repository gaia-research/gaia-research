# Living Tree contract v0 — proposal

**Status: proposed (2026-10-09).** Implemented and frozen at gate G1-C; until then field names may
move. Owners: the graph/identity half is **Tree [#2046](https://github.com/gaia-research/gaia-skill-tree/issues/2046)**;
the observation/capability half is **Heaven [#192](https://github.com/gaia-research/gaia-skill-heaven/issues/192)**.
Hub: [`README.md`](README.md).

This is the smallest contract that connects a personal Gaia DAG with Skill Heaven activity. It reuses
`@gaia-skill-heaven/status` (`SummonEvent`, `SkillReceipt`, `EvidenceClass`, the sanitizer) and the
engine's canonical identity pins (`skill-heaven.arbor-identity-context/v1`) rather than inventing a
parallel event logger or identity scheme.

## 1. Rules the contract enforces

1. **One graph.** Every source contributes to one snapshot; source and scope are instance metadata.
2. **One observation model.** The Mod consumes Skill Heaven's observations; it never runs a second
   tracker, and nothing it renders writes back into runtime state.
3. **Unknown stays unknown.** An unsupported host capability is declared, never a false negative and
   never a fabricated event. Absence of an event is not evidence of absence unless the host declares it
   can see that kind of event.
4. **Canon is read-only and edges are canon-only in B.** Typed edges come from the canonical registry
   at one recorded revision. No edge is inferred from names, similarity or co-occurrence.
5. **No host types in core.** Nothing in the Tree core package imports `claude-code` or any host type;
   adapters translate at the boundary.
6. **Deterministic.** The same inputs produce byte-identical snapshots (stable ordering; a content
   hash over canonical JSON).
7. **Untrusted text everywhere.** Names, descriptions, source labels, URLs and paths from skills,
   repos, tools or models are sanitized at the adapter edge (the status sanitizer) and escaped again at
   paint time.

## 2. Identity and provenance — `gaia.living-tree.inventory/v0`

```ts
/** One place a skill was found. Many instances may back one graph node. */
type SkillInstance = {
  key: string;                 // stable within a snapshot: hash(kind, locator ?? listing tuple, rawName)
  name: string;                // effective name, sanitized display text
  rawName: string;             // as the source spelled it, for identity only — never painted unsanitized
  description?: string;        // frontmatter description, sanitized, length-capped
  source: SourceRef;
  contentSha256?: string;      // sha256 of the SKILL.md bytes; present only after a consented read (tier 1)
  canonical: CanonicalMatch;
  visibility: "session-listed" | "on-disk-only" | "unknown";
  shadowedBy?: string;         // key of the instance the host resolves instead, when known
};

type SourceRef = {
  kind: "user" | "project" | "nested" | "plugin" | "bundled" | "synced" | "managed" | "unknown";
  scope: "global" | "repository" | "session";
  hostLabel?: string;          // the host's own word, e.g. "userSettings", "plugin", "built-in", "syncedSkills"
  pluginName?: string;
  locator?: string;            // local path — PRIVATE: never leaves the machine, never painted in full
  repoUrl?: string;            // remote provenance when a plugin manifest or source declares one
  ref?: string;
  subpath?: string;
};

type CanonicalMatch =
  | { kind: "verified"; namedId: string; genericRef: string; treeRevision: string;
      basis: "content-pin" | "source-route"; content: "same" | "differs" | "unknown" }
  | { kind: "plausible"; candidates: { genericRef: string; namedId?: string;
      basis: "name" | "plugin-name" | "word-overlap" }[] }   // never drawn as canon, never an edge
  | { kind: "unmapped" };
```

**Matching algorithm (reuses `resolveArborIdentity` discipline).** Given canon snapshot revision `R`
and the identity pins at the same `R`:

1. `verified / content-pin` — the instance's `contentSha256` equals a pinned `contentSha256`.
2. `verified / source-route` — the instance's `repoUrl` + `ref` + `subpath` resolve to exactly a
   pinned `sourceUrl`. `content` is `same` if hashes agree, `differs` if they disagree, `unknown` if the
   instance was not read.
3. `plausible` — exact id or name equality, plugin-name equality, or `gaia scan`-style word overlap
   (≥0.15) against starless generics. Shown as "possibly ⟨capability⟩" in the inspector only.
4. `unmapped` — none of the above.

**Revision rule.** If the pins' revision differs from the canon snapshot's, or from the summon corpus
revision a live event reports, nothing is `verified` — the best available class is `plausible`. A hash
from another revision describes other bytes.

**Collisions and shadowing.** Instances group into one node only through a verified canonical
identity or an identical content hash. The same name with different content yields separate nodes and a
`name-collision` diagnostic; the host's resolved choice is recorded in `shadowedBy` when the listing
reveals it, and is otherwise `unknown`.

### Inventory sources and consent tiers

| Tier | Source | Host route (Claude Code 2.1.294) | Evidence |
|---|---|---|---|
| 0 (default, zero file reads) | skills listed to the model this session — user, project, plugin, built-in, synced | `$.session.usage({ breakdown: "summary" }).context.breakdown.skills` | static; probe H8 |
| 1 (explicit consent) | `~/.claude/skills`, `<repo>/.claude/skills`, nested `.claude/skills`, `.agents/skills`, enabled plugins' `skills/` | `$.fs.list` / `$.fs.read` (4 MiB per read), `crypto.subtle` for sha256; bounded walk, cancellable | static; probe H12 |
| 2 (later, C) | account directory skills; a future fleet | the host's directory tools; separate consent | unknown |

A synced or bundled skill whose bytes are not readable stays `contentSha256: undefined`; it can be
`plausible` by name and never `verified`. The listing may be cut to its token allowance
(`includedSkills < totalSkills`); the snapshot records both numbers and the UI says so.

```ts
interface SkillInventoryAdapter {
  readonly tier: 0 | 1 | 2;
  /** Returns instances or an honest gap; never throws for an unsupported source. */
  collect(signal: AbortSignal): Promise<{ instances: SkillInstance[]; gaps: InventoryGap[] }>;
}
type InventoryGap = { source: SourceRef["kind"]; reason: "unsupported" | "not-consented" | "truncated" | "unreadable" | "error"; detail?: string };
```

## 3. The personal graph — `gaia.living-tree.graph/v0`

```ts
type PersonalGraphSnapshot = {
  schema: "gaia.living-tree.graph/v0";
  treeRevision: string;          // canon snapshot revision used for every verified match
  hash: string;                  // sha256 of the canonical JSON of nodes + edges + instances
  nodes: GraphNode[];
  edges: GraphEdge[];
  instances: SkillInstance[];
  listing?: { total: number; included: number };      // from tier 0, when the host reports it
  diagnostics: Diagnostic[];     // name-collision · revision-mismatch · unreadable · cycle-rejected · gap
};

type GraphNode = {
  id: string;                    // canon generic id, or "local:" + instance key
  kind: "capability" | "local";
  role: "possessed" | "context";        // context = canon structure you do not have
  contextReason?: "missing-prerequisite" | "eligible-fusion";
  type?: "basic" | "fusion";            // canon only
  label: string;
  instanceKeys: string[];               // empty for context nodes
  canonRank?: { level: string; branch: "standard" | "suite" | "unique"; namedId: string }; // best possessed implementation, display only
};

type GraphEdge = {
  from: string; to: string;              // both endpoints present in nodes
  type: "prerequisite" | "suite-member";
  provenance: { treeRevision: string };  // canon-only in v0
};
```

**Two views (FD-1).** The snapshot carries possessed, local and context nodes; the `mine` view draws
possessed and local nodes and the canon edges among them, and the `gaia` view draws the canon structure
— context nodes included — with possessed nodes marked. One snapshot, two projections; no view computes
its own truth.

**Projection rules.** A verified instance contributes its **capability** (generic) node; several
implementations of one capability share the node and appear as instances in the inspector. An unmapped
or plausible instance contributes a **local** node with no edges. **Context** nodes are added only as
(a) unpossessed prerequisites of a possessed fusion, or (b) canon fusions whose prerequisites are all
possessed ("eligible"), capped and labelled. Edges are canon prerequisite or suite edges whose two
endpoints are both present. The canon is a DAG; any cycle found is rejected with a diagnostic rather
than drawn.

**Diff.** `diff(a, b)` reports added/removed nodes and instances, mapping upgrades
(`plausible → verified` after a consented scan) and revision changes — the explainable refresh #2046
asks for.

## 4. Observation envelope — `skill-heaven.observation/v0`

Founder field names from #2046, extended only where the host offered something new.

```ts
type SkillObservation = {
  schemaVersion: "skill-heaven.observation/v0";
  eventId: string;
  timestamp: string;                      // ISO-8601 as the host reported it, else the adapter's clock (and says so)
  harness: string;                        // "claude-code"
  hostVersion?: string;
  sessionId?: string;
  agentId?: string | null;                // null = main conversation; absent = not reported
  skillIdentity?: {
    id?: string; name: string; sha256?: string;
    sourceUrl?: string; repoUrl?: string; ref?: string; subpath?: string;
    corpusRevision?: string;              // the Tree revision of the summon corpus, when the engine reports it
  };
  source: "skill-heaven-summon" | "skill-heaven-preview" | "host-skill-expansion" | "session-lifecycle";
  phase: "previewed" | "materialized" | "body-read" | "ended" | "unknown";
  observationKind: "observed" | "reported" | "inferred" | "unknown";
  via?: "summon-result" | "read-tool" | "skill-prompt" | "session-end";
  receiptRef?: string;                    // pointer into the console's receipt store; never the receipt text
};
```

**Mappings from what exists today.**

| Today's signal (console, verified terminal 2.1.294 unless noted) | Observation |
|---|---|
| summon result, one entry per `summoned[]` skill | `materialized`, `observed`, `via: summon-result`, identity from `SkillReceipt`, `agentId` from the `tool.call` input |
| `/lens` preview | `previewed`, `observed` |
| `Read` whose path is a materialized `SKILL.md` | `body-read`, `observed`, `via: read-tool`, joined by path |
| `skill.prompt` (static, probe H11) | `body-read`, `observed`, `via: skill-prompt`, identity `{ name }` only |
| session end / clear (probe H16) | `ended` for every live subject |

A projection that cannot observe reads (terminal statusline, a CLI door) emits `materialized` only, and
the host capability says `bodyReadObservation: unsupported` — so the UI writes "read not observed",
never "not read".

## 5. Live overlay — `gaia.living-tree.overlay/v0`

`overlay(graph, observations, capabilities) → Overlay` is a pure reducer in the Tree core.

```ts
type Overlay = {
  schema: "gaia.living-tree.overlay/v0";
  graphHash: string;
  halos: { nodeId: string; subjectKey: string; phase: Phase; match: "instance" | "capability" | "name-listed";
           agents: AgentRef[]; firstAt: string; lastAt: string; count: number; receiptRefs: string[] }[];
  visitors: { visitorId: string; subjectKey: string; kind: "canon" | "external"; label: string;
              origin: { repoUrl?: string; ref?: string; subpath?: string; sourceUrl?: string };
              canonical?: { namedId: string; genericRef: string };
              phase: Phase; agents: AgentRef[]; firstAt: string; lastAt: string; count: number; receiptRefs: string[] }[];
  history: { subjectKey: string; label: string; lastPhase: Phase; endedAt: string; placement: "halo" | "visitor" }[];
  unresolved: { observationId: string; reason: "ambiguous-name" | "no-identity" | "revision-mismatch" }[];
  notices: ("read-not-observable" | "agents-not-reported" | "listing-truncated" | "native-activity-not-observable" | "revision-mismatch")[];
};
type Phase = "previewed" | "materialized" | "body-read" | "ended";
type AgentRef = { id: string | null; label?: string };   // label sanitized; null = main
```

**Placement (first match wins):**

1. **Halo · instance** — the subject's sha256 equals a possessed instance's sha256, or its verified named
   id equals a possessed instance's named id.
2. **Halo · capability** — verified to a capability node you possess through a *different*
   implementation; the inspector names both.
3. **Halo · name-listed** — a native `skill.prompt` whose name matches exactly one session-listed
   instance. Anything ambiguous goes to `unresolved`, never to a guess.
4. **Visitor · canon** — verified canonical, capability not possessed. If that capability is already
   drawn as a context node (a missing prerequisite or an eligible fusion), the visitor marks that node
   — "visiting · not installed" — and adds nothing else; otherwise it appears in the visiting zone,
   labelled "Summoned · Gaia canon · not installed". Either way it adds no edge to your graph.
5. **Visitor · external** — everything else. Labelled "Summoned · external", origin and commit when
   known, no edges; a presentation tether may point at the agent marker, never at a skill node.

**Dedupe and counting.** `subjectKey = sha256 ?? sourceUrl ?? (source + id) ?? name`. A repeat summon
of one subject increments `count` on its one halo or visitor. The overlay never computes `skills N`.

**Lifetime.** `previewed` (optional faint suggestion) → `materialized` (arrival, once) → `body-read`
(steady while the session runs) → `ended` (to `history`). If the host reports compaction (probe H16), a
`body-read` subject becomes "read before compaction — may no longer be in context"; without that signal
the overlay never claims a skill left context.

**View flags are not semantics.** Hiding the live layer or closing the pane changes what is drawn, never
the overlay, the observations, the runtime or token use (B-ACCEPTANCE S5).

## 6. Host capabilities — `skill-heaven.host-capabilities/v0`

Extends the console-host capability matrix in draft PR #196 (`console-host.ts`) rather than starting a
second one.

```ts
type CapabilityState = "native" | "degraded" | "unsupported" | "unknown";
type Evidence = { kind: "verified" | "static" | "doc" | "unknown"; hostVersion?: string; ref?: string };
type HostCapabilities = {
  schema: "skill-heaven.host-capabilities/v0";
  harness: string; hostVersion?: string; surface: "desktop" | "terminal" | "web" | "other";
  capabilities: Record<
    | "skillListing" | "localScan" | "summonObservation" | "bodyReadObservation"
    | "nativeSkillObservation" | "agentAttribution" | "sessionLifecycle" | "compactionObservation"
    | "panel" | "vectorGraph" | "interactiveVector" | "pointerInput" | "deepLinks"
    | "theming" | "reducedMotionSignal" | "preferencePersistence",
    { state: CapabilityState; evidence: Evidence }>;
};
```

The Claude desktop declaration is filled from gaia-research matrix gate (f). A host whose `panel` or
`vectorGraph` is not `native` cannot offer B (see C-AND-HOSTS §4).

## 7. View adapter obligations

```ts
interface GraphViewAdapter {
  render(snapshot: PersonalGraphSnapshot, overlay: Overlay, view: ViewState): void;  // paint only
}
type ViewState = {
  view: "mine" | "gaia";          // FD-1: local-first My Tree, or the canon tree with your skills marked
  liveVisible: boolean; focus?: string; filter?: SourceRef["kind"][]; reducedMotion: boolean;
  remembered?: { liveVisible?: boolean };   // FD-2: only after an explicit Remember; stored in the plugin's $.store
};
```

Pixels, layout and interaction may differ per host. Identity, placement, phase, labels' meaning,
receipt links and hide/show semantics may not. Every state must be distinguishable by shape and words,
not colour alone.

## 8. Versioning

`v0` until G1-C, then `v1` frozen for B. Within a major: additive optional fields only; consumers
ignore unknown fields; removals and meaning changes bump the major and ship with a migration note and
fixtures for both. Adapters declare the range they support. When a public cross-client event or UI
standard matures, adapt at the adapter boundary — the core does not move.

## 9. Conformance fixtures

Every fixture is JSON (inventory input, canon snapshot slice, observation stream, expected snapshot and
overlay), branded `fixture`, never exported to a runtime surface.

| ID | Covers |
|---|---|
| F1 | empty session: nothing listed, nothing on disk |
| F2 | populated listing, mixed sources, listing truncated (`included < total`) |
| F3 | consented scan with collisions: same name in user and project scope; one skill via two plugins |
| F4 | canon fusion with a missing prerequisite (context node) and an eligible fusion |
| F5 | unmapped and plausible (word-overlap) skills — no edges |
| F6 | summon of a possessed skill → halo · instance → body read |
| F7 | summon of a canon skill you lack → visitor · canon |
| F8 | empty listing (Skill Zero-like) + summon from an outside GitHub repo → visitor · external |
| F9 | three agents, four summons, one repeat → counts, attribution, no double count |
| F10 | degraded host: no agent ids, no read observation → notices, no fabricated phases |
| F11 | hostile content: ANSI, bidi, markup, `</svg><script>` in a description, `..` in a subpath |
| F12 | session end; hide and show toggled mid-stream → identical overlay |
| F13 | identity pins at a different Tree revision → nothing verified |
| F14 | native `skill.prompt` events with an ambiguous name → `unresolved` |

**Two mock adapters (P1-M).** A Claude-shaped mock (Mods-style `tool.call` results as JSON strings,
`Read` paths, `agentId` on inputs) and a deliberately different generic mock (a JSONL stream shaped
like a non-Claude host's tool-execution events) both map into `skill-heaven.observation/v0`; the same
Tree reducer must produce byte-identical overlays. This proves the contract is portable. It does not
prove any host can paint B.

## 10. Homes

| Piece | Repo / package | Notes |
|---|---|---|
| inventory normalization, matching, graph projection, diff, overlay reducer, layout, F1–F14, conformance runner | gaia-skill-tree, new pure TypeScript package (working name `packages/your-skill-tree`) | Node-free, zero dependencies; may wrap the pure `docs/js/world-tree-layout.js` |
| observation envelope + mappers from console observations; host capability declaration | gaia-skill-heaven `packages/status` (`observation.ts`, `host-capabilities.ts`) | extends, never forks, the status model |
| My Tree pane, `Svg` renderer, rail, inspector; vendored Tree core bundle | gaia-skill-heaven `plugins/skill-heaven-console` | generated bundle, byte-parity checked in CI (same discipline as `status-model.mjs`) |
| canon snapshot bundled into the Mod | built at plugin build time from the Tree's published `docs/graph/gaia.json`, `named/index.json` and the identity pins, all at one revision | no new Tree publication required for B |
| desktop capability evidence | gaia-research `docs/labs/harness-capability-matrix.md` gate (f) | evidence only; decides nothing |
