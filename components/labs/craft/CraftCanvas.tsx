"use client";

/**
 * components/labs/craft/CraftCanvas.tsx
 *
 * The Infinite Skill Craft game engine — the hero surface of Lab 002.
 *
 * The interaction model is Neal Agarwal's Infinite Craft: a FREE-FLOATING
 * CANVAS. The sidebar is the *inventory* of discovered skills; the canvas is a
 * positioned 2D workspace where you place, drag, and collide skill *instances*.
 *
 * Responsibilities:
 *  - Seed 4 primitive skills; maintain a searchable, scrollable inventory sidebar.
 *  - SPAWN: click (or drag) a sidebar skill to drop a new *instance* onto the
 *    canvas. Instances carry {instanceId, cardId, x, y} — multiple copies of the
 *    same skill can coexist.
 *  - MOVE: pointer-drag an instance freely (mouse + touch; touch-action:none).
 *    Arrow keys nudge a focused instance for keyboard users.
 *  - FUSE: drop an instance so it overlaps another → POST {a,b} to the fusion
 *    API, then REPLACE both source instances with the single result instance at
 *    the drop point. Also: click/Enter selects up to two instances + a visible
 *    "Fuse selected ✦" button for the pointerless path.
 *  - TAP an instance → a detail popover anchored to it (emoji, /name, blurb,
 *    badges, and the rewarding "Open in the Skill Tree ↗" link when canonical).
 *    This popover is how the Skill-Tree funnel survives on the canvas.
 *  - Apply funny, non-punishing client-side curse gremlins and offer a 🧹 cleanse.
 *  - Persist discovered cards + active curses + the canvas layout to localStorage.
 *
 * All curse/type logic is imported from lib/craft — this file is the DOM/React layer.
 *
 * Conceptual ancestor: Neal Agarwal's Infinite Craft. Original implementation.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type { FusionResult, SkillCard } from "@/lib/craft/types";
import {
  CLEANSE_LABEL,
  CLEANSE_INACTIVE_LABEL,
  CURSES,
  getCurse,
  makeActiveCurse,
  type ActiveCurse,
} from "@/lib/craft/curses";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_URL = "/labs/infinite-skill-craft/api/fuse";
const STORAGE_CARDS = "gaia.craft.cards.v1";
const STORAGE_CURSES = "gaia.craft.curses.v1";
const STORAGE_CANVAS = "gaia.craft.canvas.v1";
const EXPERIMENTAL_TOOLTIP =
  "Milim is not 100% sure this is a real skill — you be the judge, boss.";

/** Fusion is a hit when two instance centres fall within this many px. */
const COLLISION_RADIUS = 78;
/** A pointer that moves less than this (px) between down and up is a "tap". */
const TAP_SLOP = 6;
/** Cascade offset for repeated spawns so clicks don't stack exactly. */
const SPAWN_CASCADE = 26;
/** Arrow-key nudge distance (px); Shift multiplies. */
const NUDGE = 12;

// ---------------------------------------------------------------------------
// A rendered card carries the FusionResult flags alongside SkillCard basics.
// ---------------------------------------------------------------------------

interface CraftCard extends SkillCard {
  /** Slug/name matches a real Gaia Skill Tree skill. */
  passesSkillCheck?: boolean;
  /** Deep-link to the skill page (canonical + resolvable only). */
  skillTreeUrl?: string;
  /** First discovery of this combo, anywhere. */
  isFirstDiscovery?: boolean;
  /** !passesSkillCheck — shows the gentle experimental tag. */
  experimental?: boolean;
  /** Curse marker (the eldritch error card etc.). */
  cursed?: boolean;
  /** Inert sidecar-noise card (kubernetes curse) — cannot be fused, can be deleted. */
  inert?: boolean;
}

/**
 * A positioned INSTANCE of a card on the free-floating canvas. Multiple
 * instances can point at the same inventory card. Position is normalised
 * (fraction of the canvas box) so layouts survive resize / persist cleanly.
 */
interface CanvasNode {
  instanceId: string;
  /** Inventory card id this node renders. */
  cardId: string;
  /** Normalised centre position 0..1 within the canvas box. */
  nx: number;
  ny: number;
  /** Transient: this pair is mid-fusion (shimmer). */
  fusing?: boolean;
  /** Transient: celebratory burst just landed on this fresh result. */
  landed?: "canonical" | "first" | "egg" | "plain";
}

/**
 * The four one-word ELEMENT primitives. These are the atoms every fusion is
 * built from — always present, never deletable. Each carries a playful `blurb`
 * (Milim voice) AND a factual `description` (what the element IS) so the detail
 * popover can read as a real capability even for a raw seed.
 */
const SEED_CARDS: CraftCard[] = [
  { id: "prompt", name: "/prompt", emoji: "🧠", blurb: "I ask the big model to think, boss. That's the whole trick.", description: "Ask a language model to reason or generate.", tier: "canonical" },
  { id: "code", name: "/code", emoji: "⚙️", blurb: "The hands of the agent, boss — I run the code and trust the sandbox.", description: "Execute code — the hands of the agent.", tier: "canonical" },
  { id: "web", name: "/web", emoji: "🌐", blurb: "I reach the live internet, boss. Fresh bytes, no cache excuses.", description: "Reach the live internet.", tier: "canonical" },
  { id: "data", name: "/data", emoji: "📊", blurb: "Structured stuff to chew on, boss — rows, docs, embeddings, all of it.", description: "Structured information to work over.", tier: "canonical" },
];

const SEED_IDS = new Set(SEED_CARDS.map((c) => c.id));

// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------

const uid = () => `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/**
 * Extracts the contributor handle from a skill-tree deep-link, e.g.
 * `https://gaiaskilltree.com/named/#explorer/garrytan/scrape` -> `garrytan`.
 * Returns undefined for any URL that doesn't match the explorer shape.
 */
function contributorFromSkillTreeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const m = url.match(/#explorer\/([^/]+)\/[^/]+$/);
  return m ? m[1] : undefined;
}

/** Load JSON from localStorage, tolerating any corruption. */
function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — progress simply won't persist. */
  }
}

// ---------------------------------------------------------------------------
// Card-state reducer — the single source of truth for the inventory.
// ---------------------------------------------------------------------------

type CardAction =
  | { type: "hydrate"; cards: CraftCard[] }
  | { type: "add"; card: CraftCard }
  | { type: "addMany"; cards: CraftCard[] }
  | { type: "remove"; id: string }
  | { type: "reset" };

function cardReducer(state: CraftCard[], action: CardAction): CraftCard[] {
  switch (action.type) {
    case "hydrate":
      return action.cards;
    case "add": {
      // Dedupe by normalised name — the first discovery keeps its metadata.
      const exists = state.some((c) => c.name === action.card.name);
      return exists ? state : [...state, action.card];
    }
    case "addMany": {
      const next = [...state];
      for (const card of action.cards) {
        if (!next.some((c) => c.name === card.name || c.id === card.id)) {
          next.push(card);
        }
      }
      return next;
    }
    case "remove":
      return state.filter((c) => c.id !== action.id || SEED_IDS.has(c.id));
    case "reset":
      return [...SEED_CARDS];
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CraftCanvas() {
  const [cards, dispatch] = useReducer(cardReducer, SEED_CARDS);
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [activeCurses, setActiveCurses] = useState<ActiveCurse[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]); // instance ids, max 2
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);
  const [popover, setPopover] = useState<string | null>(null); // instance id
  const [dragInstance, setDragInstance] = useState<string | null>(null);
  const [hoverTargetId, setHoverTargetId] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spawnCount = useRef(0);
  const cardsRef = useRef(cards);
  const nodesRef = useRef(nodes);
  cardsRef.current = cards;
  nodesRef.current = nodes;

  // ── Hydrate from localStorage once mounted ──────────────────────────────
  useEffect(() => {
    const savedCards = loadJSON<CraftCard[]>(STORAGE_CARDS, []);
    const merged = [...SEED_CARDS];
    for (const c of savedCards) {
      if (!merged.some((m) => m.name === c.name || m.id === c.id)) merged.push(c);
    }
    dispatch({ type: "hydrate", cards: merged });
    setActiveCurses(loadJSON<ActiveCurse[]>(STORAGE_CURSES, []));

    // Restore the canvas layout, dropping any node whose card no longer exists.
    const savedNodes = loadJSON<CanvasNode[]>(STORAGE_CANVAS, []);
    const validIds = new Set(merged.map((c) => c.id));
    const restored = Array.isArray(savedNodes)
      ? savedNodes
          .filter(
            (n) =>
              n &&
              typeof n.instanceId === "string" &&
              typeof n.cardId === "string" &&
              validIds.has(n.cardId) &&
              Number.isFinite(n.nx) &&
              Number.isFinite(n.ny)
          )
          .map((n) => ({
            instanceId: n.instanceId,
            cardId: n.cardId,
            nx: clamp01(n.nx),
            ny: clamp01(n.ny),
          }))
      : [];
    setNodes(restored);
    setHydrated(true);
  }, []);

  // ── Persist ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    // Only persist non-seed cards; seeds are re-added on load.
    saveJSON(STORAGE_CARDS, cards.filter((c) => !SEED_IDS.has(c.id)));
  }, [cards, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveJSON(STORAGE_CURSES, activeCurses);
  }, [activeCurses, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    // Persist only stable geometry (never the transient fusing/landed flags).
    saveJSON(
      STORAGE_CANVAS,
      nodes.map((n) => ({ instanceId: n.instanceId, cardId: n.cardId, nx: n.nx, ny: n.ny }))
    );
  }, [nodes, hydrated]);

  // ── Cleanup timers ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // ── Derived state ─────────────────────────────────────────────────────────
  const discoveredCount = useMemo(
    () => cards.filter((c) => !SEED_IDS.has(c.id) && !c.inert).length,
    [cards]
  );

  const cardById = useCallback(
    (id: string) => cards.find((c) => c.id === id),
    [cards]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.blurb ?? "").toLowerCase().includes(q)
    );
  }, [cards, query]);

  const hasCurse = useCallback(
    (id: string) => activeCurses.some((c) => c.id === id),
    [activeCurses]
  );

  const fridayActive = hasCurse("friday-deploy");

  // ── Toast helper ─────────────────────────────────────────────────────────
  const flashToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  }, []);

  const announce = useCallback((msg: string) => {
    setStatus(msg);
  }, []);

  // ── Curse gremlins ─────────────────────────────────────────────────────────
  // Applied to a freshly-fused card + inventory. Returns the (possibly mutated)
  // primary card plus any extra cards to inject and any cards to remove.
  const applyCurses = useCallback(
    (card: CraftCard): { primary: CraftCard; extras: CraftCard[]; removeIds: string[] } => {
      let primary = { ...card };
      const extras: CraftCard[] = [];
      const removeIds: string[] = [];
      let cursesChanged = false;
      const nextCurses = [...activeCurses];

      // parse-html-with-regex — 5% chance the result becomes the eldritch error.
      if (hasCurse("parse-html-with-regex") && Math.random() < 0.05) {
        primary = {
          ...primary,
          name: "/eldritch",
          emoji: "🐙",
          blurb: "ERROR: eldritch — the Old Ones reject your inputs, boss.",
          cursed: true,
          id: uid(),
        };
      }

      // force-push-main — next 3 discoveries get an -oops suffix + 💥.
      const oopsIdx = nextCurses.findIndex((c) => c.id === "force-push-main");
      if (oopsIdx !== -1 && (nextCurses[oopsIdx].remainingTriggers ?? 0) > 0) {
        primary = {
          ...primary,
          name: `${primary.name}-oops`,
          emoji: `💥${primary.emoji}`,
        };
        nextCurses[oopsIdx] = {
          ...nextCurses[oopsIdx],
          remainingTriggers: (nextCurses[oopsIdx].remainingTriggers ?? 1) - 1,
        };
        cursesChanged = true;
        // Auto-expire when it hits zero.
        if ((nextCurses[oopsIdx].remainingTriggers ?? 0) <= 0) {
          nextCurses.splice(oopsIdx, 1);
          flashToast("💣 Oops Commit spent — history restored, boss.");
        }
      }

      // undefined-is-not-a-function — 10% chance the label renders as "undefined".
      if (hasCurse("undefined-is-not-a-function") && Math.random() < 0.1) {
        primary = {
          ...primary,
          // Preserve real name in blurb so the tooltip / ledger keeps truth.
          blurb: `Actual value: ${primary.name}, boss.`,
          name: "undefined",
          emoji: "🫥",
        };
      }

      // kubernetes-for-todo-app — inject 5 inert sidecar cards.
      if (hasCurse("kubernetes-for-todo-app")) {
        for (let i = 1; i <= 5; i++) {
          extras.push({
            id: uid(),
            name: `/sidecar-${i}`,
            emoji: "☸️",
            blurb: "Unnecessary infrastructure, boss.",
            tier: "easteregg",
            inert: true,
            cursed: true,
          });
        }
      }

      // mongodb-is-web-scale — 15% chance one random non-seed card vanishes.
      if (hasCurse("mongodb-is-web-scale") && Math.random() < 0.15) {
        const candidates = cards.filter(
          (c) => !SEED_IDS.has(c.id) && c.id !== primary.id && !c.inert
        );
        if (candidates.length > 0) {
          const victim = candidates[Math.floor(Math.random() * candidates.length)];
          removeIds.push(victim.id);
          flashToast("🥭 MongoDB says: write acknowledged. (it was not)");
        }
      }

      if (cursesChanged) setActiveCurses(nextCurses);
      return { primary, extras, removeIds };
    },
    [activeCurses, cards, hasCurse, flashToast]
  );

  // ── Canvas geometry helpers ───────────────────────────────────────────────
  /** Client px → normalised canvas coords, clamped to the box. */
  const clientToNorm = useCallback((clientX: number, clientY: number) => {
    const box = stageRef.current?.getBoundingClientRect();
    if (!box || box.width === 0 || box.height === 0) return { nx: 0.5, ny: 0.5 };
    return {
      nx: clamp01((clientX - box.left) / box.width),
      ny: clamp01((clientY - box.top) / box.height),
    };
  }, []);

  // ── Spawn an instance onto the canvas ──────────────────────────────────────
  const spawn = useCallback(
    (cardId: string, at?: { nx: number; ny: number }) => {
      const card = cardById(cardId);
      if (!card) return;
      let pos = at;
      if (!pos) {
        // Cascade around centre so repeated clicks don't stack exactly.
        const i = spawnCount.current++;
        const box = stageRef.current?.getBoundingClientRect();
        const w = box?.width || 600;
        const h = box?.height || 420;
        const ox = ((i % 5) - 2) * (SPAWN_CASCADE / w);
        const oy = (Math.floor(i / 5) % 4) * (SPAWN_CASCADE / h);
        pos = { nx: clamp01(0.42 + ox), ny: clamp01(0.4 + oy) };
      }
      setNodes((prev) => [
        ...prev,
        { instanceId: uid(), cardId, nx: pos!.nx, ny: pos!.ny },
      ]);
      announce(`${card.name} dropped on the canvas.`);
    },
    [cardById, announce]
  );

  // ── Core fusion flow (canvas instances) ────────────────────────────────────
  // Fuse instance `aInst` into `bInst`; result lands at `dropNorm`.
  const fuseInstances = useCallback(
    async (aInst: string, bInst: string, dropNorm: { nx: number; ny: number }) => {
      if (busy) return;
      const curNodes = nodesRef.current;
      const na = curNodes.find((n) => n.instanceId === aInst);
      const nb = curNodes.find((n) => n.instanceId === bInst);
      if (!na || !nb || na.instanceId === nb.instanceId) return;
      const a = cardsRef.current.find((c) => c.id === na.cardId);
      const b = cardsRef.current.find((c) => c.id === nb.cardId);
      if (!a || !b) return;
      if (a.inert || b.inert) {
        flashToast("☸️ Sidecar cards just run 'sleep infinity', boss — can't fuse those.");
        return;
      }

      setBusy(true);
      setSelected([]);
      setPopover(null);
      // Shimmer both source instances while the forge runs.
      setNodes((prev) =>
        prev.map((n) =>
          n.instanceId === aInst || n.instanceId === bInst ? { ...n, fusing: true } : n
        )
      );
      announce(`Fusing ${a.name} with ${b.name}…`);

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ a: a.name, b: b.name }),
        });

        if (!res.ok) throw new Error(`fuse ${res.status}`);
        const result = (await res.json()) as FusionResult;

        let card: CraftCard = {
          id: uid(),
          name: result.name,
          emoji: result.emoji,
          blurb: result.blurb,
          description: result.description,
          skillTitle: result.skillTitle,
          tier: result.tier,
          passesSkillCheck: result.passesSkillCheck,
          skillTreeUrl: result.skillTreeUrl,
          isFirstDiscovery: result.isFirstDiscovery,
          experimental: result.experimental ?? !result.passesSkillCheck,
          cursed: result.cursed,
          discoveredAt: Date.now(),
        };

        // If the server says this result carries a curse, arm it client-side.
        if (result.cursed && result.curseId && getCurse(result.curseId)) {
          setActiveCurses((prev) =>
            prev.some((c) => c.id === result.curseId)
              ? prev
              : [...prev, makeActiveCurse(result.curseId as string)]
          );
          const curse = getCurse(result.curseId);
          if (curse) flashToast(`${curse.emoji} ${curse.name}: ${curse.blurb}`);
        }

        // Apply any active gremlins to the fresh card + inventory.
        const { primary, extras, removeIds } = applyCurses(card);
        card = primary;

        // Dedup + commit to the inventory sidebar.
        const isNew = !cardsRef.current.some((c) => c.name === card.name);
        // The final card that ends up in the inventory (existing one if dupe,
        // so the canvas node reuses the canonical inventory entry's id).
        const invCard = isNew
          ? card
          : cardsRef.current.find((c) => c.name === card.name) ?? card;

        for (const id of removeIds) dispatch({ type: "remove", id });
        dispatch({ type: "add", card });
        if (extras.length) dispatch({ type: "addMany", cards: extras });

        // Compute the reward tier for the celebratory burst on the instance.
        const canonical = card.tier === "canonical" && !!card.skillTreeUrl;
        const landed: NonNullable<CanvasNode["landed"]> = canonical
          ? "canonical"
          : card.isFirstDiscovery
            ? "first"
            : card.tier === "easteregg"
              ? "egg"
              : "plain";

        // REPLACE both source instances with a single result instance at the
        // drop point. Any cursed cards removed from inventory also lose nodes.
        const newInstanceId = uid();
        setNodes((prev) => {
          const removedCardIds = new Set(removeIds);
          const kept = prev.filter(
            (n) =>
              n.instanceId !== aInst &&
              n.instanceId !== bInst &&
              !removedCardIds.has(n.cardId)
          );
          return [
            ...kept,
            {
              instanceId: newInstanceId,
              cardId: invCard.id,
              nx: clamp01(dropNorm.nx),
              ny: clamp01(dropNorm.ny),
              landed,
            },
          ];
        });

        // Clear the celebratory burst flag after it plays.
        const burstMs = prefersReducedMotion() ? 0 : 1500;
        setTimeout(() => {
          setNodes((prev) =>
            prev.map((n) =>
              n.instanceId === newInstanceId ? { ...n, landed: undefined } : n
            )
          );
        }, burstMs);

        // Milim + any other listener react to the fusion.
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("isc:fused", {
              detail: {
                tier: card.tier,
                canonical,
                firstDiscovery: !!card.isFirstDiscovery,
                cursed: !!card.cursed,
                isNew,
              },
            })
          );
        }

        // A classy, non-casino toast for the earned moments.
        if (canonical) {
          flashToast(`★ Real Skill unlocked — ${invCard.name}. Tap it for the Skill Tree link, boss.`);
        } else if (card.isFirstDiscovery) {
          flashToast(`⭐ First Discovery — ${invCard.name}! Nobody had this combo before you, boss.`);
        } else if (card.tier === "easteregg" && !card.cursed) {
          flashToast(`✨ Easter egg — ${invCard.name}. Nice find, boss.`);
        }

        announce(
          `${a.name} + ${b.name} makes ${invCard.name}. ${
            card.isFirstDiscovery ? "First discovery! " : ""
          }${card.experimental ? "Experimental fusion. " : ""}${
            isNew ? "New skill added to inventory." : "Already discovered."
          } Tap it to see details.`
        );
      } catch {
        // The forge sputtered — clear the shimmer, leave the instances in place.
        setNodes((prev) =>
          prev.map((n) =>
            n.instanceId === aInst || n.instanceId === bInst
              ? { ...n, fusing: false }
              : n
          )
        );
        flashToast("The forge sputtered, boss — try that fusion again.");
        announce("Fusion failed. Try again.");
      } finally {
        setBusy(false);
      }
    },
    [busy, announce, flashToast, applyCurses]
  );

  // ── Pointer drag (move + drop-to-fuse) ──────────────────────────────────────
  // Ref-based so listeners on window read live values without re-subscribing.
  const dragState = useRef<{
    instanceId: string;
    pointerId: number;
    // offset of pointer from node centre, in normalised units
    offNx: number;
    offNy: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

  const onNodePointerDown = useCallback(
    (instanceId: string) => (e: React.PointerEvent) => {
      // Only primary button / touch / pen.
      if (e.button !== 0) return;
      const node = nodesRef.current.find((n) => n.instanceId === instanceId);
      if (!node) return;
      const box = stageRef.current?.getBoundingClientRect();
      if (!box) return;
      const pointerNx = clamp01((e.clientX - box.left) / box.width);
      const pointerNy = clamp01((e.clientY - box.top) / box.height);
      dragState.current = {
        instanceId,
        pointerId: e.pointerId,
        offNx: pointerNx - node.nx,
        offNy: pointerNy - node.ny,
        startX: e.clientX,
        startY: e.clientY,
        moved: false,
      };
      setDragInstance(instanceId);
      setPopover(null);
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        /* capture unsupported — pointer events still fire on the element. */
      }
    },
    []
  );

  const onNodePointerMove = useCallback((e: React.PointerEvent) => {
    const ds = dragState.current;
    if (!ds || ds.pointerId !== e.pointerId) return;
    const box = stageRef.current?.getBoundingClientRect();
    if (!box) return;
    const dist = Math.hypot(e.clientX - ds.startX, e.clientY - ds.startY);
    if (dist > TAP_SLOP) ds.moved = true;
    const nx = clamp01((e.clientX - box.left) / box.width - ds.offNx);
    const ny = clamp01((e.clientY - box.top) / box.height - ds.offNy);
    setNodes((prev) =>
      prev.map((n) => (n.instanceId === ds.instanceId ? { ...n, nx, ny } : n))
    );

    // Highlight a fusion target when the dragged centre nears another node.
    if (ds.moved) {
      const cx = box.left + nx * box.width;
      const cy = box.top + ny * box.height;
      let hit: string | null = null;
      for (const n of nodesRef.current) {
        if (n.instanceId === ds.instanceId) continue;
        const dx = box.left + n.nx * box.width - cx;
        const dy = box.top + n.ny * box.height - cy;
        if (Math.hypot(dx, dy) < COLLISION_RADIUS) {
          hit = n.instanceId;
          break;
        }
      }
      setHoverTargetId(hit);
    }
  }, []);

  const onNodePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const ds = dragState.current;
      if (!ds || ds.pointerId !== e.pointerId) return;
      dragState.current = null;
      setDragInstance(null);
      setHoverTargetId(null);

      if (!ds.moved) {
        // A tap — open the detail popover for this instance.
        setPopover((prev) => (prev === ds.instanceId ? null : ds.instanceId));
        return;
      }

      // A drag ended. Recompute the drop target from live geometry at release
      // time — never trust async hover state (a fast/synthetic drag may not have
      // re-rendered between moves). If the release point overlaps another node,
      // fuse; otherwise the instance simply moved.
      const box = stageRef.current?.getBoundingClientRect();
      if (box) {
        let target: string | null = null;
        for (const n of nodesRef.current) {
          if (n.instanceId === ds.instanceId) continue;
          const dx = box.left + n.nx * box.width - e.clientX;
          const dy = box.top + n.ny * box.height - e.clientY;
          if (Math.hypot(dx, dy) < COLLISION_RADIUS) {
            target = n.instanceId;
            break;
          }
        }
        if (target && target !== ds.instanceId) {
          const drop = clientToNorm(e.clientX, e.clientY);
          void fuseInstances(ds.instanceId, target, drop);
        }
      }
    },
    [clientToNorm, fuseInstances]
  );

  // Live ref retained for any external reads; hover state is purely cosmetic.
  const hoverTargetIdRef = useRef<string | null>(null);
  hoverTargetIdRef.current = hoverTargetId;

  // ── Sidebar → canvas drag-to-spawn (nice-to-have; click is required path) ──
  const onSidebarDragStart = useCallback(
    (cardId: string) => (e: React.DragEvent) => {
      const card = cardById(cardId);
      if (card?.inert) {
        e.preventDefault();
        return;
      }
      e.dataTransfer.effectAllowed = "copy";
      e.dataTransfer.setData("text/plain", `spawn:${cardId}`);
    },
    [cardById]
  );

  const onStageDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("text/plain")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  }, []);

  const onStageDrop = useCallback(
    (e: React.DragEvent) => {
      const raw = e.dataTransfer.getData("text/plain");
      if (!raw.startsWith("spawn:")) return;
      e.preventDefault();
      const cardId = raw.slice("spawn:".length);
      spawn(cardId, clientToNorm(e.clientX, e.clientY));
    },
    [spawn, clientToNorm]
  );

  // ── Keyboard: nudge a focused instance + select/fuse ───────────────────────
  // (defined after selection helpers so it can reference them directly)

  // ── Selection (click/Enter path for pointerless fusion) ────────────────────
  const toggleSelectInstance = useCallback(
    (instanceId: string) => {
      const node = nodesRef.current.find((n) => n.instanceId === instanceId);
      const card = node && cardsRef.current.find((c) => c.id === node.cardId);
      if (card?.inert) {
        flashToast("☸️ That's just a sidecar, boss — nothing to fuse.");
        return;
      }
      setSelected((prev) => {
        if (prev.includes(instanceId)) return prev.filter((x) => x !== instanceId);
        if (prev.length >= 2) return [prev[1], instanceId];
        return [...prev, instanceId];
      });
    },
    [flashToast]
  );

  const fuseSelected = useCallback(() => {
    if (selected.length !== 2) return;
    const [a, b] = selected;
    const nb = nodesRef.current.find((n) => n.instanceId === b);
    // Land the result where the second-selected instance sits.
    const drop = nb ? { nx: nb.nx, ny: nb.ny } : { nx: 0.5, ny: 0.5 };
    void fuseInstances(a, b, drop);
  }, [selected, fuseInstances]);

  const removeNode = useCallback((instanceId: string) => {
    setNodes((prev) => prev.filter((n) => n.instanceId !== instanceId));
    setSelected((prev) => prev.filter((x) => x !== instanceId));
    setPopover((prev) => (prev === instanceId ? null : prev));
  }, []);

  // ── Keyboard: nudge a focused instance + select/fuse ───────────────────────
  const onNodeKeyDown = useCallback(
    (instanceId: string) => (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? NUDGE * 3 : NUDGE;
      const box = stageRef.current?.getBoundingClientRect();
      const stepNx = box ? step / box.width : 0.02;
      const stepNy = box ? step / box.height : 0.02;
      let dx = 0;
      let dy = 0;
      switch (e.key) {
        case "ArrowLeft": dx = -stepNx; break;
        case "ArrowRight": dx = stepNx; break;
        case "ArrowUp": dy = -stepNy; break;
        case "ArrowDown": dy = stepNy; break;
        case "Enter":
        case " ":
          e.preventDefault();
          toggleSelectInstance(instanceId);
          return;
        case "Backspace":
        case "Delete":
          e.preventDefault();
          removeNode(instanceId);
          return;
        default:
          return;
      }
      e.preventDefault();
      setNodes((prev) =>
        prev.map((n) =>
          n.instanceId === instanceId
            ? { ...n, nx: clamp01(n.nx + dx), ny: clamp01(n.ny + dy) }
            : n
        )
      );
    },
    [toggleSelectInstance, removeNode]
  );

  // ── Cleanse ─────────────────────────────────────────────────────────────
  const cleanse = useCallback(() => {
    if (activeCurses.length === 0) return;
    setActiveCurses([]);
    flashToast("🧹 Cleansed! Milim swept the gremlins out, boss.");
    announce("All curses cleansed.");
  }, [activeCurses, flashToast, announce]);

  // ── Clear canvas (keeps discoveries + curses) ──────────────────────────────
  const clearCanvas = useCallback(() => {
    if (nodesRef.current.length === 0) return;
    setNodes([]);
    setSelected([]);
    setPopover(null);
    spawnCount.current = 0;
    flashToast("Canvas cleared — your discoveries are safe, boss.");
    announce("Canvas cleared. Inventory and curses kept.");
  }, [flashToast, announce]);

  // ── Reset progress (back to seeds; clears discoveries + curses + canvas) ────
  const resetProgress = useCallback(() => {
    dispatch({ type: "reset" });
    setActiveCurses([]);
    setSelected([]);
    setNodes([]);
    setPopover(null);
    setQuery("");
    spawnCount.current = 0;
    flashToast("Progress reset — back to the four primitives, boss.");
    announce("Progress reset to the four seed skills.");
  }, [flashToast, announce]);

  const deleteInventoryCard = useCallback((id: string) => {
    if (SEED_IDS.has(id)) return;
    dispatch({ type: "remove", id });
    // Drop any canvas instances of the deleted card too.
    setNodes((prev) => prev.filter((n) => n.cardId !== id));
  }, []);

  // ── Dismiss popover on outside interaction / Escape ─────────────────────────
  useEffect(() => {
    if (!popover) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPopover(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [popover]);

  // ── Render helpers ────────────────────────────────────────────────────────
  const reducedMotion = hydrated && prefersReducedMotion();

  return (
    <section
      className={`craft${fridayActive ? " craft-friday" : ""}${
        reducedMotion ? " craft-reduced" : ""
      }`}
      aria-label="Infinite Skill Craft fusion sandbox"
    >
      {/* Screen-reader live region for fusion outcomes. */}
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>

      <div className="craft-shell">
        {/* ── Sidebar: discovered skills (inventory) ─────────────────────── */}
        <aside className="craft-sidebar" aria-label="Discovered skills inventory">
          <header className="craft-sidebar-head">
            <div>
              <p className="craft-kicker">Inventory</p>
              <p className="craft-count" aria-live="off">
                <b>{discoveredCount}</b> discoveries
              </p>
            </div>
            <div className="craft-curse-controls">
              <button
                type="button"
                className="craft-cleanse"
                onClick={cleanse}
                disabled={activeCurses.length === 0}
                title={activeCurses.length === 0 ? CLEANSE_INACTIVE_LABEL : CLEANSE_LABEL}
                aria-label={activeCurses.length === 0 ? CLEANSE_INACTIVE_LABEL : CLEANSE_LABEL}
              >
                {CLEANSE_LABEL}
              </button>
            </div>
          </header>

          {/* Active-curse indicators */}
          {activeCurses.length > 0 && (
            <ul className="craft-curse-list" aria-label="Active curses">
              {activeCurses.map((ac) => {
                const curse = getCurse(ac.id) ?? CURSES[ac.id];
                if (!curse) return null;
                return (
                  <li key={ac.id} className="craft-curse-chip" title={curse.effect}>
                    <span aria-hidden="true">{curse.emoji}</span>
                    <span className="craft-curse-name">{curse.name}</span>
                    {ac.remainingTriggers != null && (
                      <span className="craft-curse-count">× {ac.remainingTriggers}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <div className="craft-search">
            <input
              type="search"
              className="craft-search-input"
              placeholder="Filter skills…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Filter discovered skills"
            />
          </div>

          <ul className="craft-list" aria-label={`${filtered.length} skills`}>
            {filtered.length === 0 && (
              <li className="craft-list-empty">No skills match “{query}”.</li>
            )}
            {filtered.map((card) => (
              <SidebarCard
                key={card.id}
                card={card}
                isSeed={SEED_IDS.has(card.id)}
                onSpawn={() => spawn(card.id)}
                onDelete={() => deleteInventoryCard(card.id)}
                onDragStart={onSidebarDragStart(card.id)}
              />
            ))}
          </ul>
        </aside>

        {/* ── The free-floating canvas workspace ─────────────────────────── */}
        <div className="craft-stage-wrap">
          <div className="craft-stage-bar">
            <p className="craft-kicker">The Forge</p>
            <div className="craft-selected" aria-live="polite">
              {selected.length === 0 ? (
                <span className="craft-hint">
                  Click a skill to drop it — drag one onto another to fuse.
                </span>
              ) : (
                selected.map((id, i) => {
                  const node = nodes.find((n) => n.instanceId === id);
                  const c = node && cardById(node.cardId);
                  if (!c) return null;
                  return (
                    <span key={id} className="craft-slot">
                      {i === 1 && <b className="craft-plus" aria-hidden="true">+</b>}
                      <span aria-hidden="true">{c.emoji}</span> {c.name}
                    </span>
                  );
                })
              )}
            </div>
            <button
              type="button"
              className="button primary craft-fuse-btn"
              onClick={fuseSelected}
              disabled={selected.length !== 2 || busy}
              title={
                selected.length !== 2
                  ? "Select two canvas instances to fuse"
                  : "Fuse the two selected instances"
              }
            >
              {busy ? "Fusing…" : "Fuse selected"} <span aria-hidden="true">✦</span>
            </button>
          </div>

          <div
            ref={stageRef}
            className={`craft-stage${dragInstance ? " craft-stage-dragging" : ""}`}
            aria-label="Fusion canvas — drop skills here and drag them together to fuse"
            onDragOver={onStageDragOver}
            onDrop={onStageDrop}
            onPointerDown={(e) => {
              // A pointerdown on the empty canvas dismisses any open popover.
              if (e.target === e.currentTarget) setPopover(null);
            }}
          >
            {nodes.length === 0 && <EmptyState discovered={discoveredCount} />}

            {nodes.map((node) => {
              const card = cardById(node.cardId);
              if (!card) return null;
              return (
                <CanvasInstance
                  key={node.instanceId}
                  node={node}
                  card={card}
                  selected={selected.includes(node.instanceId)}
                  isDragging={dragInstance === node.instanceId}
                  isHoverTarget={hoverTargetId === node.instanceId}
                  popoverOpen={popover === node.instanceId}
                  reducedMotion={reducedMotion}
                  onPointerDown={onNodePointerDown(node.instanceId)}
                  onPointerMove={onNodePointerMove}
                  onPointerUp={onNodePointerUp}
                  onKeyDown={onNodeKeyDown(node.instanceId)}
                  onClosePopover={() => setPopover(null)}
                  onDelete={() => removeNode(node.instanceId)}
                />
              );
            })}
          </div>

          <footer className="craft-stage-foot">
            <p className="craft-hint">
              <b>Click</b> a skill to drop it, <b>drag</b> instances together to fuse, and{" "}
              <b>tap</b> a result for its details. Curses are cosmetic and always cleansable.
            </p>
            <div className="craft-foot-controls">
              <button
                type="button"
                className="craft-clear"
                onClick={clearCanvas}
                disabled={nodes.length === 0}
                title="Remove everything from the canvas (keeps your discoveries)"
              >
                Clear canvas
              </button>
              <button type="button" className="craft-reset" onClick={resetProgress}>
                Reset progress
              </button>
            </div>
          </footer>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="craft-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Sidebar card (inventory item → click/Enter to spawn)
// ---------------------------------------------------------------------------

function SidebarCard({
  card,
  isSeed,
  onSpawn,
  onDelete,
  onDragStart,
}: {
  card: CraftCard;
  isSeed: boolean;
  onSpawn: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
}) {
  // Tier read: canonical skills feel valuable, easter eggs are a wink,
  // experimental combos stay curious, seeds are the trustworthy primitives.
  const canonical = !isSeed && card.tier === "canonical";
  const easteregg = card.tier === "easteregg" && !card.inert;
  const experimental = !!card.experimental && !card.cursed;
  const tierClass = canonical
    ? " is-canon"
    : easteregg
      ? " is-egg"
      : experimental
        ? " is-exp"
        : "";

  return (
    <li
      className={`craft-card${card.cursed ? " is-cursed" : ""}${
        card.inert ? " is-inert" : ""
      }${tierClass}`}
    >
      <button
        type="button"
        className="craft-card-btn"
        onClick={() => {
          if (card.inert) return;
          onSpawn();
        }}
        disabled={card.inert}
        draggable={!card.inert}
        onDragStart={onDragStart}
        title={
          card.inert
            ? card.blurb || card.name
            : `${card.blurb || card.name} — click to drop on the canvas`
        }
        aria-label={
          card.inert ? card.name : `Drop ${card.name} onto the canvas`
        }
      >
        <span className="craft-card-emoji" aria-hidden="true">
          {card.emoji}
        </span>
        <span className="craft-card-name">{card.name}</span>
        {isSeed ? (
          <span className="craft-card-tag craft-card-seed" title="Seed primitive">seed</span>
        ) : canonical ? (
          <span className="craft-card-tag craft-card-canon" title="Canonical — a real Gaia Skill Tree skill" aria-label="canonical skill">
            ★
          </span>
        ) : easteregg ? (
          <span className="craft-card-tag craft-card-egg" title="Easter egg — a hand-authored surprise" aria-label="easter egg">
            ✨
          </span>
        ) : experimental ? (
          <span className="craft-card-tag craft-card-exp" title="Experimental — Milim isn't sure this is a real skill yet" aria-label="experimental">
            🧪
          </span>
        ) : null}
      </button>
      {!isSeed && (
        <button
          type="button"
          className="craft-card-del"
          onClick={onDelete}
          title={`Remove ${card.name} from inventory`}
          aria-label={`Remove ${card.name} from inventory`}
        >
          ×
        </button>
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------
// Canvas instance — an absolutely-positioned, draggable node.
// ---------------------------------------------------------------------------

function CanvasInstance({
  node,
  card,
  selected,
  isDragging,
  isHoverTarget,
  popoverOpen,
  reducedMotion,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onKeyDown,
  onClosePopover,
  onDelete,
}: {
  node: CanvasNode;
  card: CraftCard;
  selected: boolean;
  isDragging: boolean;
  isHoverTarget: boolean;
  popoverOpen: boolean;
  reducedMotion: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onClosePopover: () => void;
  onDelete: () => void;
}) {
  const canonical = card.tier === "canonical" && !!card.skillTreeUrl;
  const easteregg = card.tier === "easteregg" && !card.inert;
  const experimental = !!card.experimental && !card.cursed;
  const first = !!card.isFirstDiscovery;

  const tierClass = canonical
    ? " is-canon"
    : easteregg
      ? " is-egg"
      : card.cursed
        ? " is-cursed"
        : experimental
          ? " is-exp"
          : "";

  return (
    <div
      className={`craft-node${tierClass}${selected ? " is-selected" : ""}${
        isDragging ? " is-dragging" : ""
      }${isHoverTarget ? " is-target" : ""}${node.fusing ? " is-fusing" : ""}${
        node.landed ? ` is-landed landed-${node.landed}` : ""
      }`}
      style={{ left: `${node.nx * 100}%`, top: `${node.ny * 100}%` }}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${card.name}${canonical ? ", canonical skill" : ""}${
        first ? ", first discovery" : ""
      }${card.cursed ? ", cursed" : ""}. Press Enter to select, arrow keys to move.`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      {/* Celebratory burst for earned results (canonical / first discovery). */}
      {node.landed && node.landed !== "plain" && !reducedMotion && (
        <span className="craft-node-burst" aria-hidden="true" />
      )}
      {node.landed && (node.landed === "canonical" || node.landed === "first") && (
        <span className="craft-node-flag" aria-hidden="true">
          {node.landed === "canonical" ? "★ Real Skill!" : "⭐ First Discovery"}
        </span>
      )}

      <span className="craft-node-emoji" aria-hidden="true">{card.emoji}</span>
      <span className="craft-node-name">{card.name}</span>
      {canonical && <span className="craft-node-badge" aria-hidden="true">★</span>}
      {easteregg && !canonical && <span className="craft-node-badge is-egg" aria-hidden="true">✨</span>}
      {experimental && <span className="craft-node-badge is-exp" aria-hidden="true">🧪</span>}
      {card.cursed && <span className="craft-node-badge is-curse" aria-hidden="true">🧟</span>}

      {/* Detail popover — the Skill-Tree funnel on the canvas. */}
      {popoverOpen && (
        <InstancePopover
          card={card}
          canonical={canonical}
          easteregg={easteregg}
          experimental={experimental}
          first={first}
          onClose={onClosePopover}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Instance detail popover — carries the Skill-Tree CTA (the funnel).
// ---------------------------------------------------------------------------

function InstancePopover({
  card,
  canonical,
  easteregg,
  experimental,
  first,
  onClose,
  onDelete,
}: {
  card: CraftCard;
  canonical: boolean;
  easteregg: boolean;
  experimental: boolean;
  first: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [flip, setFlip] = useState(false);
  const [maxH, setMaxH] = useState<number | undefined>(undefined);

  // Focus the popover on open (keyboard users land inside it). The stage is
  // overflow:hidden, so anchor on whichever side of the node has more room and
  // cap the height to that room (scrolls internally only on tiny viewports).
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const node = el.parentElement; // the .craft-node
    const stage = el.closest<HTMLElement>(".craft-stage");
    if (node && stage) {
      const nodeBox = node.getBoundingClientRect();
      const stageBox = stage.getBoundingClientRect();
      const gap = 18;
      const roomBelow = stageBox.bottom - nodeBox.bottom - gap;
      const roomAbove = nodeBox.top - stageBox.top - gap;
      const useAbove = roomAbove > roomBelow;
      setFlip(useAbove);
      setMaxH(Math.max(140, Math.floor(useAbove ? roomAbove : roomBelow)));
    }
    // Move focus into the popover for the funnel link / close.
    const focusTarget = el.querySelector<HTMLElement>("[data-autofocus]");
    focusTarget?.focus();
  }, []);

  // Credit the real contributor behind a canonical skill (derived from the
  // deep-link, so we don't need to thread another prop through).
  const contributor = contributorFromSkillTreeUrl(card.skillTreeUrl);

  return (
    <div
      ref={ref}
      className={`craft-pop${flip ? " is-flipped" : ""}`}
      role="dialog"
      aria-label={`${card.name} details`}
      style={maxH ? { maxHeight: `${maxH}px` } : undefined}
      // Stop pointer events bubbling to the node (so the popover isn't a drag).
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
    >
      <div className="craft-pop-head">
        <span className="craft-pop-emoji" aria-hidden="true">{card.emoji}</span>
        <h3 className="craft-pop-name">{card.name}</h3>
        <button
          type="button"
          className="craft-pop-close"
          onClick={onClose}
          data-autofocus
          aria-label={`Close ${card.name} details`}
        >
          ×
        </button>
      </div>

      {(canonical || first || easteregg || experimental || card.cursed) && (
        <div className="craft-pop-tags">
          {first && (
            <span className="craft-badge craft-badge-first" title="Nobody had found this combo before you, boss.">
              ⭐ First
            </span>
          )}
          {canonical && (
            <span className="craft-badge craft-badge-canon" title="A real skill in the Gaia Skill Tree.">
              ★ Real Skill
            </span>
          )}
          {easteregg && !card.cursed && (
            <span className="craft-badge craft-badge-egg" title="A hand-authored surprise, boss.">
              ✨ Easter egg
            </span>
          )}
          {card.cursed && (
            <span className="craft-badge craft-badge-curse" title="This one carries a gremlin — cleanse it whenever, boss.">
              🧟 Cursed
            </span>
          )}
          {experimental && (
            <span className="craft-badge craft-badge-exp" title={EXPERIMENTAL_TOOLTIP}>
              🧪 Experimental
            </span>
          )}
        </div>
      )}

      {/* GROUND-TRUTH block for a canonical result that maps to a real named
          skill. The real registry title leads ("Real skill: …"), the real
          registry description is the primary "what it does" line, the
          contributor is credited, and the reward CTA follows. This is what makes
          every canonical unlock read as an unmistakably real Skill Tree entry
          and keeps the funnel earned. */}
      {canonical && card.skillTreeUrl ? (
        <div className="craft-pop-real">
          {card.skillTitle && (
            <p className="craft-pop-real-title">
              <span className="craft-pop-real-label">Real skill</span>
              <span className="craft-pop-real-name">{card.skillTitle}</span>
            </p>
          )}
          {card.description && <p className="craft-pop-desc">{card.description}</p>}
          {contributor && (
            <p className="craft-pop-cred">
              Verified in the Gaia Skill Tree by{" "}
              <span className="craft-pop-cred-by">@{contributor}</span>.
            </p>
          )}
          {/* Milim's playful take stays as a quieter garnish beneath the fact. */}
          {card.blurb && (
            <p className="craft-pop-blurb is-secondary">{card.blurb}</p>
          )}
          <a
            className="craft-unlock"
            href={card.skillTreeUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            Open in the Skill Tree <span aria-hidden="true">↗</span>
          </a>
        </div>
      ) : (
        <>
          {/* Non-canonical (bridge / egg / experimental): the factual line leads,
              Milim's blurb trails as before. */}
          {card.description && <p className="craft-pop-desc">{card.description}</p>}
          {card.blurb && (
            <p className={`craft-pop-blurb${card.description ? " is-secondary" : ""}`}>
              {card.blurb}
            </p>
          )}
        </>
      )}

      <button type="button" className="craft-pop-remove" onClick={onDelete}>
        Remove from canvas
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state — invites the first spawn.
// ---------------------------------------------------------------------------

function EmptyState({ discovered }: { discovered: number }) {
  return (
    <div className="craft-empty">
      <p className="craft-empty-mark" aria-hidden="true">
        🧠 + ⚙️
      </p>
      <p className="craft-empty-head">
        {discovered === 0 ? "Empty canvas." : "Canvas cleared."}
      </p>
      <p className="craft-empty-body">
        Click <b>/prompt</b> and <b>/code</b>, boss — then drag them together and watch{" "}
        <b>/codegen</b> hatch.
      </p>
    </div>
  );
}
