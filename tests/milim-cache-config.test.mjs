import assert from "node:assert/strict";
import test from "node:test";
import config from "../next.config.mjs";

test("serves immutable Milim release paths with a one-year browser and edge cache policy", async () => {
  const nextConfig = await config("phase-production-build");
  const rules = await nextConfig.headers();
  assert.deepEqual(rules, [
    {
      source: "/milim/releases/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ]);
});
