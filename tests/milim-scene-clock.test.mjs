import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const RELEASE_ROOT = resolve("public/milim/releases/milim-web-0.3.0");

test("the promoted release artifact controls the splash scene independently of Milim", async () => {
  const manifest = JSON.parse(await readFile(join(RELEASE_ROOT, "release.json"), "utf8"));
  assert.equal(manifest.player.version, "0.3.0");
  const { mountMilimWithRuntime } = await import(
    pathToFileURL(join(RELEASE_ROOT, "player/mount.js")).href
  );

  const draws = [];
  let frameCallback = null;
  const controller = await mountMilimWithRuntime({ clientWidth: 640, clientHeight: 360 }, {
    src: pathToFileURL(join(RELEASE_ROOT, "release.json")).href,
  }, {
    baseURL: pathToFileURL(`${RELEASE_ROOT}/`).href,
    async fetch(url) {
      const body = await readFile(new URL(url), "utf8");
      return { ok: true, status: 200, async json() { return JSON.parse(body); } };
    },
    createRenderer: () => ({
      async initialize() { return { allReady: Promise.resolve() }; },
      async setScene() {},
      draw(frame) { draws.push(frame); },
      destroy() {},
    }),
    scheduler: {
      request(callback) { frameCallback = callback; return 1; },
      cancel() { frameCallback = null; },
    },
    visibility: undefined,
  });
  const frame = (timestamp) => { const cb = frameCallback; frameCallback = null; cb?.(timestamp); };

  frame(100);
  frame(116);
  assert.equal(draws.at(-1).clockMs, 16);
  assert.equal(draws.at(-1).sceneClockMs, 16);

  controller.setSceneRunning(true);
  controller.setRunning(false);
  frame(1_000);
  frame(1_016);
  assert.equal(draws.at(-1).clockMs, 16, "paused Milim keeps her frozen clock");
  assert.equal(draws.at(-1).sceneClockMs, 32, "the splash scene keeps animating independently");

  controller.setRunning(true);
  frame(2_000);
  frame(2_016);
  assert.equal(draws.at(-1).clockMs, 32, "Milim resumes without a clock jump");
  assert.equal(draws.at(-1).sceneClockMs, 48, "the scene never jumped either");

  controller.destroy();
});
