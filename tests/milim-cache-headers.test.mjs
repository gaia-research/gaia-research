import assert from "node:assert/strict";
import test from "node:test";
import { verifyMilimEdgeCacheHeaders } from "../scripts/milim-cache-headers.mjs";

test("edge cache enforcement refuses a local or plain HTTP URL", async () => {
  await assert.rejects(
    verifyMilimEdgeCacheHeaders({ edgeUrl: "http://127.0.0.1:3000", releaseVersion: "milim-web-0.2.0", fetchImpl: async () => null }),
    /HTTPS edge URL/,
  );
});

test("edge cache enforcement proves response headers for immutable and revalidated paths", async () => {
  const responses = new Map([
    ["/milim/current.json", "public, max-age=0, must-revalidate"],
    ["/milim/releases/milim-web-0.2.0/release.json", "public, max-age=31536000, immutable"],
    ["/milim/releases/milim-web-0.2.0/player/index.js", "public, max-age=31536000, immutable"],
  ]);
  const report = await verifyMilimEdgeCacheHeaders({
    edgeUrl: "https://edge.example.test",
    releaseVersion: "milim-web-0.2.0",
    fetchImpl: async (url) => {
      const pathname = new URL(url).pathname;
      return {
        ok: true,
        status: 200,
        headers: new Headers({ "cache-control": responses.get(pathname), "cf-cache-status": "HIT" }),
      };
    },
  });

  assert.equal(report.ok, true);
  assert.equal(report.proof, "edge-response-headers");
  assert.equal(report.checks.length, 3);
  assert.equal(report.checks.every((check) => check.serverApplied), true);
});

test("edge cache enforcement fails when the edge omits immutable", async () => {
  const report = await verifyMilimEdgeCacheHeaders({
    edgeUrl: "https://edge.example.test",
    releaseVersion: "milim-web-0.2.0",
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: new Headers({ "cache-control": "public, max-age=31536000" }),
    }),
  });

  assert.equal(report.ok, false);
  assert.equal(report.checks.some((check) => !check.serverApplied), true);
});
