#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export async function verifyMilimEdgeCacheHeaders({ edgeUrl, releaseVersion, fetchImpl = fetch }) {
  const base = new URL(edgeUrl);
  if (base.protocol !== "https:") throw new Error("Cache enforcement requires an HTTPS edge URL; local HTTP headers are not edge proof.");

  const definitions = [
    {
      pathname: "/milim/current.json",
      expected: "public, max-age=0, must-revalidate",
      matches: (value) => hasDirective(value, "public") && hasDirective(value, "max-age=0") && hasDirective(value, "must-revalidate"),
    },
    ...[
      `/milim/releases/${releaseVersion}/release.json`,
      `/milim/releases/${releaseVersion}/player/index.js`,
    ].map((pathname) => ({
      pathname,
      expected: "public, max-age=31536000, immutable",
      matches: (value) => hasDirective(value, "public") && hasDirective(value, "max-age=31536000") && hasDirective(value, "immutable"),
    })),
  ];

  const checks = await Promise.all(definitions.map(async ({ pathname, expected, matches }) => {
    const url = new URL(pathname, base).href;
    try {
      const response = await fetchImpl(url, { method: "GET", redirect: "follow" });
      const cacheControl = response.headers.get("cache-control") ?? "";
      return {
        pathname,
        url,
        status: response.status,
        cacheControl,
        cfCacheStatus: response.headers.get("cf-cache-status") ?? "",
        expected,
        serverApplied: response.ok && matches(cacheControl),
      };
    } catch (error) {
      return { pathname, url, status: 0, cacheControl: "", cfCacheStatus: "", expected, serverApplied: false, error: String(error) };
    }
  }));

  return {
    ok: checks.every((check) => check.serverApplied),
    proof: "edge-response-headers",
    edgeUrl: base.origin,
    releaseVersion,
    checks,
  };
}

function hasDirective(value, expected) {
  return value.split(",").some((directive) => directive.trim().toLowerCase() === expected);
}

function readArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith("--")) throw new Error(`Unknown argument: ${key}`);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for ${key}`);
    result[key.slice(2)] = value;
    index += 1;
  }
  return result;
}

async function main() {
  const args = readArgs(process.argv.slice(2));
  if (!args["edge-url"]) throw new Error("Missing --edge-url. Supply the deployed Cloudflare HTTPS origin to collect edge proof.");
  const releaseVersion = args.release
    ?? JSON.parse(await readFile(new URL("../public/milim/current.json", import.meta.url), "utf8")).release;
  const report = await verifyMilimEdgeCacheHeaders({ edgeUrl: args["edge-url"], releaseVersion });
  console.log(JSON.stringify(report));
  if (!report.ok) process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
