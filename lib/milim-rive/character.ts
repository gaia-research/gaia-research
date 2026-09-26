/*
 * lib/milim-rive/character.ts — Milim's semantic character interface.
 *
 * Milim is a Rive character (source: gaia-research/milim, rive/milim). All
 * deformation, animation and state logic lives in the .riv; this adapter only
 * translates a tiny vocabulary into view-model writes:
 *
 *   character.expression("thinking")
 *   character.look({ x, y })          // -1..1, smoothed here
 *   character.perform("greet")
 *   character.setRunning(false)
 *
 * The Rive runtime is imported lazily so it never touches the initial bundle.
 */

import { MILIM_RIVE } from "./asset";

export const EXPRESSIONS = ["neutral", "joyful", "thinking", "surprised"] as const;
export const GESTURES = ["greet", "point", "celebrate"] as const;
export type Expression = (typeof EXPRESSIONS)[number];
export type Gesture = (typeof GESTURES)[number];

/** Gesture lengths in the .riv, used to avoid stacking gestures. */
const GESTURE_MS: Record<Gesture, number> = { greet: 2500, point: 2300, celebrate: 2100 };

export interface MilimCharacter {
  expression(name: Expression): void;
  look(target: { x: number; y: number }): void;
  perform(name: Gesture): boolean;
  setRunning(running: boolean): void;
  resize(): void;
  destroy(): void;
}

export interface MilimCharacterOptions {
  /** Wander the gaze gently when look() has not been called for a while. */
  autonomy?: boolean;
  /** Called once the first frame has been drawn. */
  onReady?: () => void;
}

type RiveModule = typeof import("@rive-app/webgl2");

let runtime: Promise<RiveModule> | null = null;
function loadRuntime(): Promise<RiveModule> {
  runtime ??= import("@rive-app/webgl2").then((mod) => {
    mod.RuntimeLoader.setWasmUrl(MILIM_RIVE.wasm);
    return mod;
  });
  return runtime;
}

const clamp = (v: number) => Math.max(-1, Math.min(1, Number.isFinite(v) ? v : 0));

export async function createMilimCharacter(
  canvas: HTMLCanvasElement,
  options: MilimCharacterOptions = {},
): Promise<MilimCharacter> {
  const rive = await loadRuntime();

  const instance = await new Promise<InstanceType<RiveModule["Rive"]>>((resolve, reject) => {
    const r = new rive.Rive({
      src: MILIM_RIVE.src,
      canvas,
      artboard: "Milim",
      stateMachines: "Milim",
      autoplay: false,
      autoBind: true,
      layout: new rive.Layout({ fit: rive.Fit.Contain, alignment: rive.Alignment.BottomCenter }),
      onLoad: () => resolve(r),
      onLoadError: () => reject(new Error("Milim .riv failed to load")),
    });
  });

  const vm = instance.viewModelInstance;
  if (!vm) {
    instance.cleanup();
    throw new Error("Milim .riv has no bound view model");
  }
  instance.resizeDrawingSurfaceToCanvas();

  const lookX = vm.number("lookX");
  const lookY = vm.number("lookY");
  const expr = vm.enum("expression");

  let running = false;
  let destroyed = false;
  let busyUntil = 0;
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  let lastLookAt = 0;
  let wanderAt = 0;
  let raf = 0;
  let last = 0;

  const step = (now: number) => {
    raf = 0;
    if (!running || destroyed) return;
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now;

    if (options.autonomy && now - lastLookAt > 4000 && now > wanderAt) {
      // Idle gaze: small, unhurried glances, mostly near centre.
      target.x = (Math.random() * 2 - 1) * 0.45;
      target.y = (Math.random() * 2 - 1) * 0.25;
      wanderAt = now + 2200 + Math.random() * 3800;
    }

    // Critically damped-ish follow: quick to start, soft to settle.
    const k = 1 - Math.exp(-dt * 5.5);
    current.x += (target.x - current.x) * k;
    current.y += (target.y - current.y) * k;
    if (lookX) lookX.value = current.x;
    if (lookY) lookY.value = current.y;
    raf = requestAnimationFrame(step);
  };

  const character: MilimCharacter = {
    expression(name) {
      if (expr && EXPRESSIONS.includes(name)) expr.value = name;
    },
    look({ x, y }) {
      target.x = clamp(x);
      target.y = clamp(y);
      lastLookAt = performance.now();
    },
    perform(name) {
      const now = performance.now();
      if (!GESTURES.includes(name) || now < busyUntil) return false;
      const trig = vm.trigger(name);
      if (!trig) return false;
      trig.trigger();
      busyUntil = now + GESTURE_MS[name];
      return true;
    },
    setRunning(next) {
      if (destroyed || next === running) return;
      running = next;
      if (running) {
        instance.play();
        last = 0;
        raf ||= requestAnimationFrame(step);
      } else {
        instance.pause();
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    resize() {
      if (!destroyed) instance.resizeDrawingSurfaceToCanvas();
    },
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      instance.cleanup();
    },
  };

  // Draw the resting pose once so a paused character is never blank.
  instance.drawFrame();
  options.onReady?.();
  return character;
}
