#!/usr/bin/env node
/**
 * scripts/craft/local-cache-cron.mjs
 *
 * LOCAL SESSION ONLY — not a Cloudflare cron trigger.
 *
 * A tiny heartbeat that runs every 5 minutes while we develop/test Infinite
 * Skill Craft. Its only job is to make sure the dev fusion cache
 * (.craft-dev-cache.json, written by the /api/fuse dev-fallback shim) is
 * healthy and snapshotted, so a `next dev` restart never forces us to
 * recompute — and, once real Workers AI is wired, never re-pay — a fusion we
 * already spent this session.
 *
 * It does NOT call the LLM and it does NOT touch Cloudflare. It just:
 *   1. reads the local cache file,
 *   2. logs how many pairs are cached + file size,
 *   3. writes a timestamped backup snapshot (.craft-dev-cache.bak.json).
 *
 * Run:  node scripts/craft/local-cache-cron.mjs        (loops every 5 min)
 *       node scripts/craft/local-cache-cron.mjs --once (single check)
 */

import { readFile, writeFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const CACHE = join(process.cwd(), '.craft-dev-cache.json');
const BACKUP = join(process.cwd(), '.craft-dev-cache.bak.json');
const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes — per boss

async function check() {
  const ts = new Date().toISOString();
  try {
    const raw = await readFile(CACHE, 'utf8');
    const obj = JSON.parse(raw);
    const count = Object.keys(obj).length;
    const { size } = await stat(CACHE);
    await writeFile(BACKUP, raw, 'utf8');
    console.log(`[craft-cache ${ts}] ok — ${count} pairs cached (${size} B), snapshot saved.`);
  } catch (err) {
    console.log(`[craft-cache ${ts}] no cache yet (${err.code || 'empty'}). Nothing to snapshot.`);
  }
}

const once = process.argv.includes('--once');
await check();
if (!once) {
  console.log(`[craft-cache] heartbeat every ${INTERVAL_MS / 60000} min — Ctrl+C to stop.`);
  setInterval(check, INTERVAL_MS);
}
