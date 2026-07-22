import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("serves immutable Milim release paths with a one-year browser and edge cache policy", async () => {
  const rules = await readFile(new URL("../public/_headers", import.meta.url), "utf8");
  assert.equal(rules, "/milim/releases/*\n  Cache-Control: public, max-age=31536000, immutable\n");
});
