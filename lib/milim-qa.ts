import type { MilimExpression } from "./milim-player-loader";
import type { MilimLiveMode } from "./milim-live-runtime";

// This is a Phase 2 tracer matrix, deliberately not a Phase 3/4 approval surface.
export const MILIM_QA_SCENES = ["cyber-slime-lab-v2"] as const;
export const MILIM_QA_EXPRESSIONS = ["neutral", "joyful-winker"] as const satisfies readonly MilimExpression[];
export const MILIM_QA_MOTIONS = ["idle"] as const;
export const MILIM_QA_MODES = ["live", "fallback", "reduced-motion", "missing-release"] as const satisfies readonly MilimLiveMode[];

export type MilimQaScene = (typeof MILIM_QA_SCENES)[number];
export type MilimQaExpression = (typeof MILIM_QA_EXPRESSIONS)[number];
export type MilimQaMotion = (typeof MILIM_QA_MOTIONS)[number];
export type MilimQaMode = (typeof MILIM_QA_MODES)[number];
export type MilimQaQuery = { scene: MilimQaScene; expression: MilimQaExpression; motion: MilimQaMotion; mode: MilimQaMode };

const DEFAULT_QUERY: MilimQaQuery = { scene: "cyber-slime-lab-v2", expression: "neutral", motion: "idle", mode: "live" };

function pick<Value extends string>(value: string | null, choices: readonly Value[], fallback: Value): Value {
  return value !== null && (choices as readonly string[]).includes(value) ? value as Value : fallback;
}

/** Parse the deliberately small, replayable Phase 2 review vocabulary. */
export function parseMilimQaQuery(params: URLSearchParams): MilimQaQuery {
  return {
    scene: pick(params.get("scene"), MILIM_QA_SCENES, DEFAULT_QUERY.scene),
    expression: pick(params.get("expression"), MILIM_QA_EXPRESSIONS, DEFAULT_QUERY.expression),
    motion: pick(params.get("motion"), MILIM_QA_MOTIONS, DEFAULT_QUERY.motion),
    mode: pick(params.get("mode"), MILIM_QA_MODES, DEFAULT_QUERY.mode),
  };
}

/** Missing-release is a live loader probe, not a request to suppress mounting. */
export function resolveMilimQaRuntimeMode(mode: MilimQaMode): MilimLiveMode {
  return mode === "missing-release" ? "live" : mode;
}
