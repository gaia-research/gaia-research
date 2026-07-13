import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default async function config(phase) {
  // The Cloudflare bridge is for `next dev` only. Loading it during a build
  // starts a remote Worker session and makes static builds require credentials.
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    const { initOpenNextCloudflareForDev } = await import("@opennextjs/cloudflare");
    initOpenNextCloudflareForDev();
  }

  return nextConfig;
}
