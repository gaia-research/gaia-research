import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      type: "asset/source",
    });
    return config;
  },
};

export default async function config(phase) {
  // The Cloudflare bridge is for `next dev` only. Loading it during a build
  // starts a remote Worker session and makes static builds require credentials.
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    try {
      const { initOpenNextCloudflareForDev } = await import("@opennextjs/cloudflare");
      await initOpenNextCloudflareForDev();
    } catch (e) {
      // Cloudflare credentials not available — dev server still works,
      // KV/D1/R2 bindings will be unavailable. Run `wrangler login` to enable.
      console.warn("[dev] Cloudflare bridge skipped (no credentials):", e?.message ?? e);
    }
  }

  return nextConfig;
}
