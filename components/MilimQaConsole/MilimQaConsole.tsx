"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MilimLive, { MILIM_RELEASE_URL, type MilimLifecycle } from "@/components/MilimLive";
import type { MilimController, MilimDurableState } from "@/lib/milim-player-loader";
import { MILIM_QA_EXPRESSIONS, MILIM_QA_MODES, MILIM_QA_MOTIONS, MILIM_QA_SCENES, resolveMilimQaRuntimeMode, type MilimQaQuery } from "@/lib/milim-qa";

type QaSnapshot = { ready: boolean; query: MilimQaQuery; lifecycle: MilimLifecycle | null; statuses: string[] };

declare global {
  interface Window {
    __MILIM_QA__?: { version: 1; snapshot(): QaSnapshot; set(state: Partial<Pick<MilimDurableState, "scene" | "expression">>): QaSnapshot; forceContextLoss(): void };
  }
}

const FALLBACK_SRC = "/assets/north-star-live/milim-live-full-body-sprite-v01.webp";

export function MilimQaConsole({ query }: { query: MilimQaQuery }) {
  const controllerRef = useRef<MilimController | null>(null);
  const snapshotRef = useRef<QaSnapshot>({ ready: false, query, lifecycle: null, statuses: [] });
  const [snapshot, setSnapshot] = useState(snapshotRef.current);
  const publish = useCallback((next: Partial<QaSnapshot>) => { snapshotRef.current = { ...snapshotRef.current, ...next }; setSnapshot(snapshotRef.current); }, []);
  const onReady = useCallback((controller: MilimController) => { controllerRef.current = controller; controller.set({ scene: query.scene, expression: query.expression }); publish({ ready: true }); }, [publish, query.expression, query.scene]);
  const onLifecycle = useCallback((lifecycle: MilimLifecycle) => publish({ lifecycle }), [publish]);
  const onStatus = useCallback((status: unknown) => {
    const name = typeof status === "object" && status !== null && "type" in status ? String(status.type) : "status";
    publish({ statuses: [...snapshotRef.current.statuses, name] });
  }, [publish]);

  useEffect(() => { snapshotRef.current = { ready: false, query, lifecycle: null, statuses: [] }; controllerRef.current = null; setSnapshot(snapshotRef.current); }, [query]);
  useEffect(() => {
    window.__MILIM_QA__ = {
      version: 1,
      snapshot: () => snapshotRef.current,
      set(state) { controllerRef.current?.set(state); return snapshotRef.current; },
      forceContextLoss() { document.querySelector<HTMLCanvasElement>(".milim-qa-stage .milim-live-canvas")?.dispatchEvent(new Event("webglcontextlost", { cancelable: true })); },
    };
    return () => { delete window.__MILIM_QA__; };
  }, []);

  const releaseUrl = query.mode === "missing-release" ? "/milim/releases/missing/release.json" : MILIM_RELEASE_URL;
  const rendered = useMemo(() => JSON.stringify(snapshot, null, 2), [snapshot]);
  return <main className="milim-qa">
    <header className="milim-qa-head"><p className="signal"><span /> PHASE 2 REVIEW SURFACE</p><h1>Milim tracer QA</h1><p>Semantic controls only: one tracer expression, the independently packaged animated Milim splash, and every static fallback path. Later expression and motion review belongs to Phase 4.</p></header>
    <MilimLive className="milim-qa-stage" fallbackSrc={FALLBACK_SRC} fallbackAlt="Static Milim fallback used for tracer QA." width={1024} height={1536} sizes="100vw" mode={resolveMilimQaRuntimeMode(query.mode)} releaseUrl={releaseUrl} initialState={{ scene: query.scene, expression: query.expression }} onReady={onReady} onLifecycle={onLifecycle} onStatus={onStatus} />
    <section className="milim-qa-output" aria-labelledby="milim-qa-state"><div><h2 id="milim-qa-state" className="sr-only">Machine-readable QA state</h2><pre data-testid="milim-qa-state">{rendered}</pre></div><button className="button secondary" type="button" onClick={() => window.__MILIM_QA__?.forceContextLoss()}>Test context fallback</button></section>
    <section className="milim-qa-matrix" aria-labelledby="milim-qa-matrix-title"><h2 id="milim-qa-matrix-title">Phase 2 matrix</h2><ul><li><strong>Expression:</strong> {MILIM_QA_EXPRESSIONS.join(", ")}</li><li><strong>Motion:</strong> {MILIM_QA_MOTIONS.join(", ")}</li><li><strong>Scene:</strong> {MILIM_QA_SCENES.join(", ")}</li><li><strong>Fallbacks:</strong> {MILIM_QA_MODES.filter((mode) => mode !== "live").join(", ")}</li></ul></section>
  </main>;
}
