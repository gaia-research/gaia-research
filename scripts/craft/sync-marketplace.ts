/**
 * scripts/craft/sync-marketplace.ts
 *
 * Automated ingestion of external agent skill marketplaces and repositories (SKILL.md specs).
 * Source registry: gaia-skill-tree/registry/skill-sources.md
 *
 * Merges external SKILL.md skills into data/craft/named-index.json with source metadata
 * (`src`, `srcUrl`), enabling Infinite Skill Craft to promote emergent fusions
 * directly into real external ecosystem skills (Anthropic, SkillKit, Matt Pocock, Superpowers).
 *
 * Usage: npx tsx scripts/craft/sync-marketplace.ts
 */

import fs from 'node:fs';
import path from 'node:path';

const INDEX_PATH = path.resolve(__dirname, '../../data/craft/named-index.json');
const ROSTER_PATH = path.resolve(__dirname, '../../data/craft/contributors.json');

type SkillSourceType = 'anthropic' | 'mattpocock' | 'addyosmani' | 'superpowers' | 'skillkit' | 'glincker' | 'registry';

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
  src?: SkillSourceType;
  srcUrl?: string;
}

interface NamedIndexJson {
  generatedAt?: string;
  skills: Record<string, RawSkillRecord>;
  slugToContributor: Record<string, string>;
  unlinkedSlugs: string[];
}

/** Pre-indexed seed SKILL.md agent marketplace skills from skill-sources.md */
const MARKETPLACE_SEEDS: Array<{
  slug: string;
  contributor: string;
  title: string;
  description: string;
  src: SkillSourceType;
  srcUrl: string;
}> = [
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
    slug: 'mattpocock-typescript-pro',
    contributor: 'mattpocock',
    title: 'Matt Pocock TypeScript Type Surgery',
    description: 'Matt Pocock SKILL.md for diagnosing complex generic types, infer types, and type assertions.',
    src: 'mattpocock',
    srcUrl: 'https://github.com/mattpocock/skills',
  },
  {
    slug: 'addyosmani-web-perf-audit',
    contributor: 'addyosmani',
    title: 'Addy Osmani Web Performance Audit',
    description: 'Addy Osmani SKILL.md for analyzing Core Web Vitals, bundle size, and rendering bottlenecks.',
    src: 'addyosmani',
    srcUrl: 'https://github.com/addyosmani/agent-skills',
  },
  {
    slug: 'obra-superpowers-system-audit',
    contributor: 'obra',
    title: 'Superpowers System Security Audit',
    description: 'Obra Superpowers SKILL.md for scanning dependencies, shell environment, and permission risks.',
    src: 'superpowers',
    srcUrl: 'https://github.com/obra/superpowers',
  },
  {
    slug: 'skillkit-react-testing-suite',
    contributor: 'skillkit',
    title: 'SkillKit React Component Testing Package',
    description: 'SkillKit marketplace package for scaffolding Vitest and React Testing Library unit tests.',
    src: 'skillkit',
    srcUrl: 'https://skillkit.io',
  },
  {
    slug: 'glincker-claude-refactor-pro',
    contributor: 'glincker',
    title: 'GLINCKER Claude Code Refactoring Skill',
    description: 'GLINCKER Claude Code Marketplace SKILL.md for incremental refactoring and clean code architecture.',
    src: 'glincker',
    srcUrl: 'https://github.com/GLINCKER/claude-code-marketplace',
  },
];

export function syncMarketplaceSkills(): { added: number; total: number } {
  if (!fs.existsSync(INDEX_PATH)) {
    console.warn(`⚠ ${INDEX_PATH} not found.`);
    return { added: 0, total: 0 };
  }

  // Purge any legacy MCP seeds from named-index.json to keep index pure SKILL.md only
  const raw = fs.readFileSync(INDEX_PATH, 'utf8');
  const index = JSON.parse(raw) as NamedIndexJson;

  delete index.skills['mcp-postgres-connector'];
  delete index.skills['mcp-brave-search'];
  delete index.skills['skillsmp-github-automation'];
  delete index.skills['obra-superpowers-bash'];
  delete index.slugToContributor['mcp-postgres-connector'];
  delete index.slugToContributor['mcp-brave-search'];
  delete index.slugToContributor['skillsmp-github-automation'];
  delete index.slugToContributor['obra-superpowers-bash'];

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
  console.log(`✅ Ingested ${addedCount} SKILL.md marketplace skills into named-index.json (Total: ${Object.keys(index.skills).length})`);
  return { added: addedCount, total: Object.keys(index.skills).length };
}

if (require.main === module) {
  syncMarketplaceSkills();
}
