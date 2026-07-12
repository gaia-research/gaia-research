// scripts/craft/seed-emojis.ts
//
// Validates and prints the curated emoji map at data/craft/emoji-map.json.
//
// Design: emoji-map.json is the source of truth — a STATIC, hand-curated
// mapping of skill slugs (slash-prefixed) to fitting emojis.
//
// This script intentionally does NOT call any live AI or generate anything.
// It just validates the map against the skills catalog and prints a summary.
//
// Run: npx tsx scripts/craft/seed-emojis.ts

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const WORKTREE_ROOT = path.resolve(__dirname, '../..');
const EMOJI_MAP_PATH = path.join(WORKTREE_ROOT, 'data/craft/emoji-map.json');
const SKILLS_PATH = path.join(WORKTREE_ROOT, 'data/craft/skills.json');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EmojiMap = Record<string, string>;

interface SkillEntry {
  id: string;
  name: string;
  displayName: string;
  type: string;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validate(emojiMap: EmojiMap, skills: SkillEntry[]): void {
  const skillIds = new Set(skills.map(s => s.id));
  let warnings = 0;
  let matched = 0;

  for (const [key, emoji] of Object.entries(emojiMap)) {
    // Key must be slash-prefixed: "/api-call"
    if (!key.startsWith('/')) {
      console.warn(`  ⚠ Key "${key}" is missing leading slash — should be "/${key}"`);
      warnings++;
      continue;
    }

    const slug = key.slice(1);  // strip leading slash

    // Check emoji is a non-empty string
    if (typeof emoji !== 'string' || emoji.trim() === '') {
      console.warn(`  ⚠ "${key}" has empty or invalid emoji`);
      warnings++;
      continue;
    }

    // Check if the slug exists in the skills catalog
    if (skillIds.has(slug)) {
      matched++;
    } else {
      console.warn(`  ⚠ "${key}" slug not found in skills.json — may be a typo or named-skill alias`);
      warnings++;
    }
  }

  const total = Object.keys(emojiMap).length;
  console.log(`\n📊 Emoji map summary:`);
  console.log(`   Total entries : ${total}`);
  console.log(`   Matched skills: ${matched}`);
  console.log(`   Warnings      : ${warnings}`);

  if (warnings === 0) {
    console.log('   ✅ All entries valid!');
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('🎨 Gaia Craft emoji map validator\n');

  if (!fs.existsSync(EMOJI_MAP_PATH)) {
    console.error(`❌ emoji-map.json not found at: ${EMOJI_MAP_PATH}`);
    console.error('   Run scripts/craft/sync-skill-tree.ts first to generate skills.json');
    process.exit(1);
  }

  if (!fs.existsSync(SKILLS_PATH)) {
    console.error(`❌ skills.json not found at: ${SKILLS_PATH}`);
    console.error('   Run scripts/craft/sync-skill-tree.ts first.');
    process.exit(1);
  }

  const emojiMap: EmojiMap = JSON.parse(fs.readFileSync(EMOJI_MAP_PATH, 'utf8'));
  const skills: SkillEntry[] = JSON.parse(fs.readFileSync(SKILLS_PATH, 'utf8'));

  console.log(`📁 Loaded ${Object.keys(emojiMap).length} emoji entries`);
  console.log(`📁 Loaded ${skills.length} skills from catalog\n`);

  // Print a few sample entries
  console.log('Sample entries:');
  Object.entries(emojiMap).slice(0, 8).forEach(([k, v]) => {
    console.log(`  ${v}  ${k}`);
  });
  console.log('  ...\n');

  validate(emojiMap, skills);

  console.log('\n✨ Done. emoji-map.json is the source of truth — edit it directly to curate mappings.');
}

main();
