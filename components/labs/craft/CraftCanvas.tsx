"use client";

/**
 * components/labs/craft/CraftCanvas.tsx
 *
 * The Infinite Skill Craft game engine — the hero surface of Lab 002.
 *
 * Responsibilities:
 *  - Seed 4 primitive skills; maintain a searchable, scrollable discovered-skills sidebar.
 *  - Drag a card onto another to fuse (HTML5 DnD); also click-to-select two + Fuse
 *    for keyboard / touch accessibility.
 *  - POST { a, b } (slash-names) to the fusion API, animate the result, dedupe into
 *    the sidebar, and celebrate canonical unlocks.
 *  - Apply funny, non-punishing client-side curse gremlins and offer a 🧹 cleanse.
 *  - Persist discovered cards + active curses to localStorage (no accounts).
 *
 * All curse/type logic is imported from lib/craft — this file is the DOM/React layer.
 *
 * Conceptual ancestor: Neal Agarwal's Infinite Craft. Original implementation.
 */

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
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
const EXPERIMENTAL_TOOLTIP =
  "Milim is not 100% sure this is a real skill — you be the judge, boss.";

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

/** The four seed primitives. These are always present and never deletable. */
const SEED_CARDS: CraftCard[] = [
  { id: "api-call", name: "/api-call", emoji: "⚡", blurb: "Reach out and call an endpoint, boss.", tier: "canonical" },
  { id: "chain-of-thought", name: "/chain-of-thought", emoji: "🧠", blurb: "Think it through, step by step.", tier: "canonical" },
  { id: "browser-control", name: "/browser-control", emoji: "🌐", blurb: "Drive a real browser like it owes you money.", tier: "canonical" },
  { id: "code-execution", name: "/code-execution", emoji: "⚙️", blurb: "Run the code. Trust the sandbox.", tier: "canonical" },
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
  const [activeCurses, setActiveCurses] = useState<ActiveCurse[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]); // card ids, max 2
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [reveal, setReveal] = useState<CraftCard | null>(null);
  const [toast, setToast] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const liveRef = useRef<HTMLParagraphElement | null>(null);

  // ── Hydrate from localStorage once mounted ──────────────────────────────
  useEffect(() => {
    const savedCards = loadJSON<CraftCard[]>(STORAGE_CARDS, []);
    const merged = [...SEED_CARDS];
    for (const c of savedCards) {
      if (!merged.some((m) => m.name === c.name || m.id === c.id)) merged.push(c);
    }
    dispatch({ type: "hydrate", cards: merged });
    setActiveCurses(loadJSON<ActiveCurse[]>(STORAGE_CURSES, []));
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

  // ── Cleanup timers ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (revealTimer.current) clearTimeout(revealTimer.current);
    };
  }, []);

  // ── Derived state ─────────────────────────────────────────────────────────
  const discoveredCount = useMemo(
    () => cards.filter((c) => !SEED_IDS.has(c.id) && !c.inert).length,
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

  // ── Core fusion flow ───────────────────────────────────────────────────────
  const fuse = useCallback(
    async (aId: string, bId: string) => {
      if (busy) return;
      const a = cards.find((c) => c.id === aId);
      const b = cards.find((c) => c.id === bId);
      if (!a || !b) return;
      if (a.inert || b.inert) {
        flashToast("☸️ Sidecar cards just run 'sleep infinity', boss — can't fuse those.");
        return;
      }

      setBusy(true);
      setSelected([]);
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

        for (const id of removeIds) dispatch({ type: "remove", id });

        // Reveal animation, then commit to sidebar.
        setReveal(card);
        const isNew = !cards.some((c) => c.name === card.name);
        dispatch({ type: "add", card });
        if (extras.length) dispatch({ type: "addMany", cards: extras });

        // Let the mascot (and any other listener) react to the fusion. Canonical
        // unlocks and first discoveries get a louder spark than a routine combo.
        if (typeof window !== "undefined") {
          const canonical = card.tier === "canonical" && !!card.skillTreeUrl;
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

        announce(
          `${a.name} + ${b.name} makes ${card.name}. ${
            card.isFirstDiscovery ? "First discovery! " : ""
          }${card.experimental ? "Experimental fusion. " : ""}${isNew ? "New skill added." : "Already discovered."}`
        );

        const revealMs = (prefersReducedMotion() ? 0 : 1400) * (fridayActive ? 4 : 1);
        if (revealTimer.current) clearTimeout(revealTimer.current);
        revealTimer.current = setTimeout(() => setReveal(null), revealMs + 900);
      } catch {
        flashToast("The forge sputtered, boss — try that fusion again.");
        announce("Fusion failed. Try again.");
      } finally {
        setBusy(false);
      }
    },
    [busy, cards, announce, flashToast, applyCurses, fridayActive]
  );

  // ── Selection (click / keyboard path) ────────────────────────────────────
  const toggleSelect = useCallback(
    (id: string) => {
      const card = cards.find((c) => c.id === id);
      if (card?.inert) {
        flashToast("☸️ That's just a sidecar, boss — nothing to fuse.");
        return;
      }
      setSelected((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        if (prev.length >= 2) return [prev[1], id];
        return [...prev, id];
      });
    },
    [cards, flashToast]
  );

  const fuseSelected = useCallback(() => {
    if (selected.length === 2) fuse(selected[0], selected[1]);
  }, [selected, fuse]);

  // ── Drag & drop handlers ──────────────────────────────────────────────────
  const onDragStart = useCallback(
    (id: string) => (e: React.DragEvent) => {
      const card = cards.find((c) => c.id === id);
      if (card?.inert) {
        e.preventDefault();
        return;
      }
      setDragId(id);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", id);
    },
    [cards]
  );

  const onDragEnd = useCallback(() => {
    setDragId(null);
    setDropTargetId(null);
  }, []);

  // ── Cleanse ─────────────────────────────────────────────────────────────
  const cleanse = useCallback(() => {
    if (activeCurses.length === 0) return;
    setActiveCurses([]);
    flashToast("🧹 Cleansed! Milim swept the gremlins out, boss.");
    announce("All curses cleansed.");
  }, [activeCurses, flashToast, announce]);

  // ── Reset progress ────────────────────────────────────────────────────────
  const resetProgress = useCallback(() => {
    dispatch({ type: "reset" });
    setActiveCurses([]);
    setSelected([]);
    setQuery("");
    flashToast("Progress reset — back to the four primitives, boss.");
  }, [flashToast]);

  const deleteCard = useCallback(
    (id: string) => {
      if (SEED_IDS.has(id)) return;
      dispatch({ type: "remove", id });
      setSelected((prev) => prev.filter((x) => x !== id));
    },
    []
  );

  // ── Render helpers ────────────────────────────────────────────────────────
  const reducedMotion = hydrated && prefersReducedMotion();

  return (
    <section
      className={`craft${fridayActive ? " craft-friday" : ""}`}
      aria-label="Infinite Skill Craft fusion sandbox"
    >
      {/* Screen-reader live region for fusion outcomes. */}
      <p ref={liveRef} className="sr-only" role="status" aria-live="polite">
        {status}
      </p>

      <div className="craft-shell">
        {/* ── Sidebar: discovered skills ─────────────────────────────────── */}
        <aside className="craft-sidebar" aria-label="Discovered skills">
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
                selected={selected.includes(card.id)}
                isSeed={SEED_IDS.has(card.id)}
                onSelect={() => toggleSelect(card.id)}
                onDelete={() => deleteCard(card.id)}
                onDragStart={onDragStart(card.id)}
                onDragEnd={onDragEnd}
                onDropFuse={(sourceId) => {
                  if (sourceId && sourceId !== card.id) fuse(sourceId, card.id);
                }}
                dragging={dragId === card.id}
              />
            ))}
          </ul>
        </aside>

        {/* ── Canvas / fusion stage ──────────────────────────────────────── */}
        <div className="craft-stage-wrap">
          <div className="craft-stage-bar">
            <p className="craft-kicker">The Forge</p>
            <div className="craft-selected" aria-live="polite">
              {selected.length === 0 && (
                <span className="craft-hint">Pick two skills, or drag one onto another.</span>
              )}
              {selected.map((id, i) => {
                const c = cards.find((x) => x.id === id);
                if (!c) return null;
                return (
                  <span key={id} className="craft-slot">
                    {i === 1 && <b className="craft-plus" aria-hidden="true">+</b>}
                    <span aria-hidden="true">{c.emoji}</span> {c.name}
                  </span>
                );
              })}
            </div>
            <button
              type="button"
              className="button primary craft-fuse-btn"
              onClick={fuseSelected}
              disabled={selected.length !== 2 || busy}
              title={
                selected.length !== 2
                  ? "Select two skills to fuse"
                  : "Fuse the two selected skills"
              }
            >
              {busy ? "Fusing…" : "Fuse"} <span aria-hidden="true">✦</span>
            </button>
          </div>

          <div
            className={`craft-stage${dropTargetId ? " craft-stage-armed" : ""}`}
            aria-label="Fusion canvas"
          >
            {reveal ? (
              <ResultCard
                card={reveal}
                reducedMotion={reducedMotion}
                friday={fridayActive}
              />
            ) : (
              <EmptyState discovered={discoveredCount} />
            )}

            {/* Invisible drop targets are the sidebar cards themselves;
                the stage also accepts a drop of the *selected* card to fuse
                with the drag source (nice-to-have kept simple: onto stage = hint). */}
            <div
              className="craft-stage-dropzone"
              onDragOver={(e) => {
                if (dragId) {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (selected.length === 1 && dragId && selected[0] !== dragId) {
                  fuse(selected[0], dragId);
                }
                setDragId(null);
                setDropTargetId(null);
              }}
              aria-hidden="true"
            />
          </div>

          <footer className="craft-stage-foot">
            <p className="craft-hint">
              Drop a card <b>onto another card</b> in the inventory to fuse — or select two and hit
              Fuse. Curses are cosmetic and always cleansable.
            </p>
            <button type="button" className="craft-reset" onClick={resetProgress}>
              Reset progress
            </button>
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
// Sidebar card
// ---------------------------------------------------------------------------

function SidebarCard({
  card,
  selected,
  isSeed,
  onSelect,
  onDelete,
  onDragStart,
  onDragEnd,
  onDropFuse,
  dragging,
}: {
  card: CraftCard;
  selected: boolean;
  isSeed: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDropFuse: (sourceId: string) => void;
  dragging: boolean;
}) {
  const [dropArmed, setDropArmed] = useState(false);

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
      className={`craft-card${selected ? " is-selected" : ""}${dragging ? " is-dragging" : ""}${
        dropArmed ? " is-drop" : ""
      }${card.cursed ? " is-cursed" : ""}${card.inert ? " is-inert" : ""}${tierClass}`}
      draggable={!card.inert}
      onDragStart={onDragStart}
      onDragEnd={() => {
        setDropArmed(false);
        onDragEnd();
      }}
      onDragOver={(e) => {
        if (!card.inert) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          setDropArmed(true);
        }
      }}
      onDragLeave={() => setDropArmed(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDropArmed(false);
        const sourceId = e.dataTransfer.getData("text/plain");
        if (sourceId) onDropFuse(sourceId);
      }}
    >
      <button
        type="button"
        className="craft-card-btn"
        onClick={onSelect}
        aria-pressed={selected}
        title={card.blurb || card.name}
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
          aria-label={`Remove ${card.name}`}
        >
          ×
        </button>
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------
// Result card (the reveal)
// ---------------------------------------------------------------------------

function ResultCard({
  card,
  reducedMotion,
  friday,
}: {
  card: CraftCard;
  reducedMotion: boolean;
  friday: boolean;
}) {
  const canonical = card.tier === "canonical" && !!card.skillTreeUrl;
  const easteregg = card.tier === "easteregg";
  const first = !!card.isFirstDiscovery;

  return (
    <div
      className={`craft-result${reducedMotion ? " reduced" : ""}${
        canonical ? " is-canonical" : ""
      }${easteregg ? " is-egg" : ""}${card.cursed ? " is-cursed" : ""}${
        first ? " is-first" : ""
      }${friday ? " is-friday" : ""}`}
    >
      {/* Forge charge — an expanding ring of light that resolves into the card.
          Canonical unlocks add a second amber halo; first discoveries add rays. */}
      <span className="craft-result-charge" aria-hidden="true" />
      {(canonical || first) && (
        <span className="craft-result-rays" aria-hidden="true" />
      )}

      {canonical && (
        <p className="craft-result-banner" aria-hidden="true">
          ★ Real Skill!
        </p>
      )}

      <div className="craft-result-emoji" aria-hidden="true">
        {card.emoji}
      </div>
      <h3 className="craft-result-name">{card.name}</h3>

      <div className="craft-result-tags">
        {first && (
          <span className="craft-badge craft-badge-first" title="Nobody had found this combo before you, boss.">
            ⭐ First Discovery
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
        {card.experimental && (
          <span className="craft-badge craft-badge-exp" title={EXPERIMENTAL_TOOLTIP}>
            🧪 Experimental fusion
          </span>
        )}
      </div>

      <p className="craft-result-blurb">{card.blurb}</p>

      {canonical && (
        <a
          className="craft-unlock"
          href={card.skillTreeUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          Open in the Skill Tree <span aria-hidden="true">↗</span>
        </a>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ discovered }: { discovered: number }) {
  return (
    <div className="craft-empty">
      <p className="craft-empty-mark" aria-hidden="true">
        ⚡ + 🧠
      </p>
      <p className="craft-empty-head">
        {discovered === 0 ? "Nothing forged yet." : "The forge is idle."}
      </p>
      <p className="craft-empty-body">
        Drag <b>/api-call</b> onto <b>/chain-of-thought</b> — or select any two skills and hit{" "}
        <b>Fuse</b>. Let&apos;s see what hatches, boss.
      </p>
    </div>
  );
}
