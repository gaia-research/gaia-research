"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MilimLive, {
  MILIM_RELEASE_URL,
  type MilimLifecycle,
} from "@/components/MilimLive";
import type { MilimController, MilimDurableState } from "@/lib/milim-player-loader";
import {
  MILIM_QA_EXPRESSIONS,
  MILIM_QA_MODES,
  MILIM_QA_MOTIONS,
  MILIM_QA_SCENES,
  type MilimQaQuery,
} from "@/lib/milim-qa";

type QaSnapshot = {
  ready: boolean;
  query: MilimQaQuery;
  lifecycle: MilimLifecycle | null;
  events: string[];
};
type QaRunState = {
  scene?: MilimDurableState["scene"];
  expression?: MilimDurableState["expression"];
  motion?: "idle" | "greet" | "point";
};

declare global {
  interface Window {
    __MILIM_QA__?: {
      version: 1;
      catalog: { expressions: readonly string[]; motions: readonly string[]; scenes: readonly string[]; modes: readonly string[] };
      snapshot: () => QaSnapshot;
      run: (state: QaRunState) => Promise<QaSnapshot>;
    };
  }
}

const FALLBACK_SRC = "/assets/north-star-live/milim-live-full-body-sprite-v01.webp";

export function MilimQaConsole({ query }: { query: MilimQaQuery }) {
  const controllerRef = useRef<MilimController | null>(null);
  const snapshotRef = useRef<QaSnapshot>({ ready: false, query, lifecycle: null, events: [] });
  const autoplayedRef = useRef(false);
  const [snapshot, setSnapshot] = useState(snapshotRef.current);

  const publish = useCallback((next: Partial<QaSnapshot>) => {
    snapshotRef.current = { ...snapshotRef.current, ...next };
    setSnapshot(snapshotRef.current);
  }, []);

  const run = useCallback(async (state: QaRunState) => {
    const controller = controllerRef.current;
    if (!controller) return snapshotRef.current;
    const durable = { scene: state.scene, expression: state.expression };
    if (durable.scene || durable.expression) controller.set(durable);
    if (state.motion && state.motion !== "idle") await controller.perform(state.motion);
    const events = [...snapshotRef.current.events, `${state.scene ?? "same"}/${state.expression ?? "same"}/${state.motion ?? "idle"}`];
    publish({ events });
    return snapshotRef.current;
  }, [publish]);

  const onReady = useCallback((controller: MilimController) => {
    controllerRef.current = controller;
    publish({ ready: true });
    void run(query);
  }, [publish, query, run]);

  const onLifecycle = useCallback((lifecycle: MilimLifecycle) => publish({ lifecycle }), [publish]);

  useEffect(() => {
    snapshotRef.current = { ready: false, query, lifecycle: null, events: [] };
    autoplayedRef.current = false;
    setSnapshot(snapshotRef.current);
  }, [query]);

  useEffect(() => {
    if (!query.autoplay || !snapshot.ready || autoplayedRef.current || query.mode !== "live") return;
    autoplayedRef.current = true;
    let cancelled = false;
    void (async () => {
      for (const scene of MILIM_QA_SCENES) {
        for (const expression of MILIM_QA_EXPRESSIONS) {
          if (cancelled) return;
          await run({ scene, expression, motion: "idle" });
        }
      }
      for (const motion of MILIM_QA_MOTIONS.filter((motion) => motion !== "idle")) {
        if (cancelled) return;
        await run({ motion });
      }
    })();
    return () => { cancelled = true; };
  }, [query.autoplay, query.mode, run, snapshot.ready]);

  useEffect(() => {
    window.__MILIM_QA__ = {
      version: 1,
      catalog: { expressions: MILIM_QA_EXPRESSIONS, motions: MILIM_QA_MOTIONS, scenes: MILIM_QA_SCENES, modes: MILIM_QA_MODES },
      snapshot: () => snapshotRef.current,
      run,
    };
    return () => { delete window.__MILIM_QA__; };
  }, [run]);

  const releaseUrl = query.mode === "missing-release" ? "/milim/releases/missing/release.json" : MILIM_RELEASE_URL;
  const mode = query.mode === "reduced-motion" ? "reduced-motion" : query.mode === "fallback" ? "fallback" : "live";
  const rendered = useMemo(() => JSON.stringify(snapshot, null, 2), [snapshot]);

  return (
    <main className="milim-qa">
      <header className="milim-qa-head">
        <p className="signal"><span /> DETERMINISTIC REVIEW SURFACE</p>
        <h1>Milim QA Console</h1>
        <p>URL-query driven review of the immutable release. This route is intentionally noindex and is the only public place that exposes review variants.</p>
      </header>
      <MilimLive
        className="milim-qa-stage"
        fallbackSrc={FALLBACK_SRC}
        fallbackAlt="Static Milim fallback used for QA verification."
        width={1024}
        height={1536}
        sizes="100vw"
        mode={mode}
        releaseUrl={releaseUrl}
        initialState={{ scene: query.scene, expression: query.expression }}
        onReady={onReady}
        onLifecycle={onLifecycle}
      />
      <section className="milim-qa-output" aria-labelledby="milim-qa-state">
        <div><h2 id="milim-qa-state" className="sr-only">Machine-readable QA state</h2><pre data-testid="milim-qa-state">{rendered}</pre></div>
        <button className="button secondary" type="button" onClick={() => void run({ scene: query.scene, expression: query.expression, motion: query.motion })}>Replay case</button>
      </section>
      <section className="milim-qa-matrix" aria-labelledby="milim-qa-matrix-title">
        <h2 id="milim-qa-matrix-title">Required matrix</h2>
        <ul><li><strong>Expressions:</strong> {MILIM_QA_EXPRESSIONS.join(", ")}</li><li><strong>Motions:</strong> {MILIM_QA_MOTIONS.join(", ")}</li><li><strong>Scenes:</strong> {MILIM_QA_SCENES.join(", ")}</li><li><strong>Fallbacks:</strong> {MILIM_QA_MODES.filter((mode) => mode !== "live").join(", ")}</li></ul>
      </section>
    </main>
  );
}
