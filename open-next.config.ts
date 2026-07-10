// default open-next.config.ts file created by @opennextjs/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
// import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

const config = defineCloudflareConfig({
	// For best results consider enabling R2 caching
	// See https://opennext.js.org/cloudflare/caching for more details
	// incrementalCache: r2IncrementalCache
});

// package.json "build" runs `opennextjs-cloudflare build` so Cloudflare's
// default `npm run build` produces the worker. That means OpenNext's *inner*
// Next build must NOT be `npm run build` (it would recurse into itself) —
// `defineCloudflareConfig` drops unknown keys, so pin it on the returned
// config, where OpenNext's buildNextjsApp reads `config.buildCommand`.
export default { ...config, buildCommand: "npx next build" };
