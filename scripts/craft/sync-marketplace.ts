/**
 * scripts/craft/sync-marketplace.ts
 *
 * Automated ingestion of external marketplace and open-source agent skills.
 * Source registry: gaia-skill-tree/registry/skill-sources.md
 *
 * Merges external skills into data/craft/named-index.json with source metadata
 * (`src`, `srcUrl`), enabling Infinite Skill Craft to promote emergent fusions
 * directly into real external ecosystem skills (MCP, Anthropic, SkillsMP).
 *
 * Usage: npx tsx scripts/craft/sync-marketplace.ts
 */

import fs from 'node:fs';
import path from 'node:path';

const INDEX_PATH = path.resolve(__dirname, '../../data/craft/named-index.json');
const ROSTER_PATH = path.resolve(__dirname, '../../data/craft/contributors.json');

interface ContributorRoster {
  total: number;
  contributors: Record<string, { count: number }>;
}

interface RawSkillRecord {
  c: string;
  t: string;
  g?: string;
  d: string;
  lvl?: string;
  src?: 'mcp' | 'anthropic' | 'skillsmp' | 'registry';
  srcUrl?: string;
}

interface NamedIndexJson {
  generatedAt?: string;
  skills: Record<string, RawSkillRecord>;
  slugToContributor: Record<string, string>;
  unlinkedSlugs: string[];
}

/** Pre-indexed seed marketplace skills from skill-sources.md */
const MARKETPLACE_SEEDS: Array<{
  slug: string;
  contributor: string;
  title: string;
  description: string;
  src: 'mcp' | 'anthropic' | 'skillsmp' | 'registry';
  srcUrl: string;
}> = [
  {
    slug: 'anthropic-web-search',
    contributor: 'anthropics',
    title: 'Anthropic Web Search & Research Skill',
    description: 'Official Anthropic agent skill for searching the web and synthesizing citations.',
    src: 'anthropic',
    srcUrl: 'https://github.com/anthropics/skills',
  },
  {
    slug: 'anthropic-code-interpreter',
    contributor: 'anthropics',
    title: 'Anthropic Code Interpreter Skill',
    description: 'Executes Python code in a secure sandbox to solve data and analysis tasks.',
    src: 'anthropic',
    srcUrl: 'https://github.com/anthropics/skills',
  },
  {
    slug: 'mcp-postgres-connector',
    contributor: 'mcp-so',
    title: 'MCP PostgreSQL Database Tool',
    description: 'Model Context Protocol tool for inspecting schemas and executing PostgreSQL queries.',
    src: 'mcp',
    srcUrl: 'https://mcp.so',
  },
  {
    slug: 'mcp-brave-search',
    contributor: 'mcp-so',
    title: 'MCP Brave Search Tool',
    description: 'Model Context Protocol tool providing web and local search access to AI agents.',
    src: 'mcp',
    srcUrl: 'https://mcp.so',
  },
  {
    slug: 'skillsmp-github-automation',
    contributor: 'skillsmp',
    title: 'SkillsMP GitHub PR & Issue Workflow',
    description: 'SkillsMP marketplace skill for triaging GitHub issues and managing pull requests.',
    src: 'skillsmp',
    srcUrl: 'https://skillsmp.com',
  },
  {
    slug: 'obra-superpowers-bash',
    contributor: 'obra',
    title: 'Superpowers Autonomous Bash Controller',
    description: 'Obra superpowers skill for executing terminal commands and inspecting system output.',
    src: 'anthropic',
    srcUrl: 'https://github.com/obra/superpowers',
  },
];

export function syncMarketplaceSkills(): { added: number; total: number } {
  if (!fs.existsSync(INDEX_PATH)) {
    console.warn(`⚠ ${INDEX_PATH} not found.`);
    return { added: 0, total: 0 };
  }

  const raw = fs.readFileSync(INDEX_PATH, 'utf8');
  const index = JSON.parse(raw) as NamedIndexJson;

  let addedCount = 0;

  for (const item of MARKETPLACE_SEEDS) {
    if (!index.skills[item.slug]) {
      index.skills[item.slug] = {
        c: item.contributor,
        t: item.title,
        d: item.description,
        src: item.src,
        srcUrl: item.srcUrl,
      };
      index.slugToContributor[item.slug] = item.contributor;
      addedCount++;
    }
  }

  // Re-count all contributor authorship in named-index.json to keep contributors.json synced
  const roster: ContributorRoster = { total: 0, contributors: {} };
  for (const rec of Object.values(index.skills)) {
    if (rec.c) {
      roster.contributors[rec.c] ??= { count: 0 };
      roster.contributors[rec.c].count += 1;
    }
  }
  roster.total = Object.keys(roster.contributors).length;

  fs.writeFileSync(ROSTER_PATH, JSON.stringify(roster, null, 2), 'utf8');
  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2), 'utf8');
  console.log(`✅ Ingested ${addedCount} marketplace skills into named-index.json (Total: ${Object.keys(index.skills).length})`);
  return { added: addedCount, total: Object.keys(index.skills).length };
}

if (require.main === module) {
  syncMarketplaceSkills();
}
