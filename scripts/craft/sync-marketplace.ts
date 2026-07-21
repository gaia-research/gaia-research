/**
 * scripts/craft/sync-marketplace.ts
 *
 * Automated ingestion of allowed external agent skill marketplaces.
 * Approved Load-Bearing Marketplaces:
 *   1. SkillsMP (`skillsmp`)
 *   2. SkillKit (`skillkit`)
 *   3. GLINCKER Claude Marketplace (`glincker`)
 *   4. Anthropic Official Skills (`anthropic`)
 *   5. NousResearch Hermes Agent (`nousresearch`)
 *
 * BLACKLIST ENFORCEMENT: Any source outside of these approved marketplaces
 * (e.g. personal individual repos, mcp servers, npm packages, etc.) is strictly
 * blocked/blacklisted from marketplace ingestion.
 *
 * Usage: npx tsx scripts/craft/sync-marketplace.ts
 */

import fs from 'node:fs';
import path from 'node:path';

const INDEX_PATH = path.resolve(__dirname, '../../data/craft/named-index.json');
const ROSTER_PATH = path.resolve(__dirname, '../../data/craft/contributors.json');

/** Approved load-bearing marketplaces strictly allowed in Infinite Skill Craft */
export const ALLOWED_MARKETPLACES = [
  'skillsmp',
  'skillkit',
  'glincker',
  'anthropic',
  'nousresearch',
] as const;

export type AllowedMarketplace = (typeof ALLOWED_MARKETPLACES)[number];

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
  src?: AllowedMarketplace | 'registry';
  srcUrl?: string;
}

interface NamedIndexJson {
  generatedAt?: string;
  skills: Record<string, RawSkillRecord>;
  slugToContributor: Record<string, string>;
  unlinkedSlugs: string[];
}

/** Pre-indexed seed SKILL.md marketplace skills from allowed sources only */
const MARKETPLACE_SEEDS: Array<{
  slug: string;
  contributor: string;
  title: string;
  description: string;
  src: AllowedMarketplace;
  srcUrl: string;
}> = [
  {
    slug: 'skillsmp-web-audit',
    contributor: 'skillsmp',
    title: 'SkillsMP Web Performance Audit Skill',
    description: 'SkillsMP marketplace SKILL.md for analyzing performance and rendering bottlenecks.',
    src: 'skillsmp',
    srcUrl: 'https://skillsmp.com',
  },
  {
    slug: 'skillkit-react-testing-suite',
    contributor: 'skillkit',
    title: 'SkillKit React Component Testing Package',
    description: 'SkillKit marketplace SKILL.md package for scaffolding unit and component tests.',
    src: 'skillkit',
    srcUrl: 'https://skillkit.io',
  },
  {
    slug: 'glincker-claude-refactor-pro',
    contributor: 'glincker',
    title: 'GLINCKER Claude Code Refactoring Skill',
    description: 'GLINCKER Claude Code Marketplace SKILL.md for incremental refactoring and architecture.',
    src: 'glincker',
    srcUrl: 'https://github.com/GLINCKER/claude-code-marketplace',
  },
  {
    slug: 'anthropic-frontend-design',
    contributor: 'anthropics',
    title: 'Anthropic Frontend Design Skill',
    description: 'Official Anthropic SKILL.md for generating responsive UI components and design tokens.',
    src: 'anthropic',
    srcUrl: 'https://github.com/anthropics/skills/tree/main/skills/frontend-design',
  },
  {
    slug: 'anthropic-pdf-processor',
    contributor: 'anthropics',
    title: 'Anthropic PDF Document Parser',
    description: 'Official Anthropic SKILL.md for extracting structured markdown and tables from PDF documents.',
    src: 'anthropic',
    srcUrl: 'https://github.com/anthropics/skills/tree/main/skills/pdf-processor',
  },
  {
    slug: 'nousresearch-hermes-agent-orchestrator',
    contributor: 'nousresearch',
    title: 'NousResearch Hermes Agent Swarm Orchestrator',
    description: 'Official NousResearch Hermes Agent SKILL.md for multi-agent swarm orchestration.',
    src: 'nousresearch',
    srcUrl: 'https://github.com/NousResearch/hermes-agent',
  },
];

export function syncMarketplaceSkills(): { added: number; total: number } {
  if (!fs.existsSync(INDEX_PATH)) {
    console.warn(`⚠ ${INDEX_PATH} not found.`);
    return { added: 0, total: 0 };
  }

  const raw = fs.readFileSync(INDEX_PATH, 'utf8');
  const index = JSON.parse(raw) as NamedIndexJson;

  // BLACKLIST ENFORCEMENT: Purge any non-allowed external marketplace seeds
  const allowedSet = new Set<string>([...ALLOWED_MARKETPLACES, 'registry']);
  for (const [slug, rec] of Object.entries(index.skills)) {
    if (rec.src && !allowedSet.has(rec.src)) {
      delete index.skills[slug];
      delete index.slugToContributor[slug];
    }
  }

  let addedCount = 0;

  for (const item of MARKETPLACE_SEEDS) {
    // Blacklist guardrail check
    if (!ALLOWED_MARKETPLACES.includes(item.src)) {
      console.warn(`⛔ Blocked blacklisted marketplace source: ${item.src}`);
      continue;
    }

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
  console.log(`✅ Ingested ${addedCount} approved marketplace skills into named-index.json (Total: ${Object.keys(index.skills).length})`);
  return { added: addedCount, total: Object.keys(index.skills).length };
}

if (require.main === module) {
  syncMarketplaceSkills();
}
