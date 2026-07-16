import type { MilimExpression } from "./milim-player-loader";

export const MILIM_QA_SCENES = [
  "cyber-slime-lab-v2",
  "slime-reactor-halo-v2",
  "dragon-signal-observatory-v2",
] as const;

export const MILIM_QA_EXPRESSIONS = [
  "neutral",
  "joyful-winker",
  "demon-lord-smirk",
  "starry-awe",
  "chaos-gremlin",
] as const satisfies readonly MilimExpression[];

export const MILIM_QA_MOTIONS = ["idle", "greet", "point"] as const;
export const MILIM_QA_MODES = ["live", "fallback", "reduced-motion", "missing-release"] as const;

export type MilimQaScene = (typeof MILIM_QA_SCENES)[number];
export type MilimQaExpression = (typeof MILIM_QA_EXPRESSIONS)[number];
export type MilimQaMotion = (typeof MILIM_QA_MOTIONS)[number];
export type MilimQaMode = (typeof MILIM_QA_MODES)[number];

export type MilimQaQuery = {
  scene: MilimQaScene;
  expression: MilimQaExpression;
  motion: MilimQaMotion;
  mode: MilimQaMode;
  autoplay: boolean;
  measure: boolean;
};

const DEFAULT_QUERY: MilimQaQuery = {
  scene: "cyber-slime-lab-v2",
  expression: "neutral",
  motion: "idle",
  mode: "live",
  autoplay: false,
  measure: false,
};

function pick<Value extends string>(value: string | null, choices: readonly Value[], fallback: Value): Value {
  return value !== null && (choices as readonly string[]).includes(value) ? value as Value : fallback;
}

/** Parse the deliberately small, replayable QA URL vocabulary. */
export function parseMilimQaQuery(params: URLSearchParams): MilimQaQuery {
  return {
    scene: pick(params.get("scene"), MILIM_QA_SCENES, DEFAULT_QUERY.scene),
    expression: pick(params.get("expression"), MILIM_QA_EXPRESSIONS, DEFAULT_QUERY.expression),
    motion: pick(params.get("motion"), MILIM_QA_MOTIONS, DEFAULT_QUERY.motion),
    mode: pick(params.get("mode"), MILIM_QA_MODES, DEFAULT_QUERY.mode),
    autoplay: params.get("autoplay") === "1",
    measure: params.get("measure") === "1",
  };
}
