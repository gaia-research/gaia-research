import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

const here = import.meta.dirname;
const matrix = JSON.parse(readFileSync(join(here, "data/r2/task-matrix.json"), "utf8"));
const bundle = join(here, "r2-bundle");
describe("R2 pinned fixture/evaluator bundle", () => {
  for (const task of matrix.tasks) it(`${task.slot} evaluator is reproducible on its pinned passing artifact`, () => {
    const work = mkdtempSync(join(tmpdir(), `r2-${task.slot}-`));
    try {
      cpSync(join(bundle, task.fixture), work, { recursive: true });
      cpSync(join(bundle, "evaluators"), join(work, "evaluators"), { recursive: true });
      const publicFixture = JSON.parse(readFileSync(join(work, "fixture.json"), "utf8"));
      const fixture = JSON.parse(readFileSync(join(work, `evaluators/expected/${publicFixture.slot}.json`), "utf8"));
      for (const output of fixture.outputs) {
        const path = join(work, output.file); mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, typeof output.content === "string" ? output.content : JSON.stringify(output.content, null, 2) + "\n");
      }
      const run = () => spawnSync("/bin/sh", ["-lc", task.endpoint.command], { cwd: work, encoding: "utf8" });
      const first = run(), second = run();
      expect(first.status, first.stderr).toBe(0); expect(second.status, second.stderr).toBe(0);
      expect({ status: second.status, stdout: second.stdout, stderr: second.stderr }).toEqual({ status: first.status, stdout: first.stdout, stderr: first.stderr });
    } finally { rmSync(work, { recursive: true, force: true }); }
  }, 20_000);
});
