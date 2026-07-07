import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

function fetchUrl(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        resolve(null);
        return;
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    }).on('error', () => {
      resolve(null);
    });
  });
}

async function getRepoDoc(repoName: string): Promise<string> {
  const localDir = path.resolve(__dirname, `../../${repoName}`);
  const remoteBaseUrl = `https://raw.githubusercontent.com/gaia-research/${repoName}/main`;

  // 1. Try local SKILL.md
  const localSkillPath = path.join(localDir, 'SKILL.md');
  if (fs.existsSync(localSkillPath)) {
    try {
      console.log(`Found local SKILL.md for ${repoName}`);
      return fs.readFileSync(localSkillPath, 'utf-8');
    } catch (e) {
      console.warn(`Error reading local SKILL.md for ${repoName}:`, e);
    }
  }

  // 2. Try local README.md
  const localReadmePath = path.join(localDir, 'README.md');
  if (fs.existsSync(localReadmePath)) {
    try {
      console.log(`Found local README.md for ${repoName}`);
      return fs.readFileSync(localReadmePath, 'utf-8');
    } catch (e) {
      console.warn(`Error reading local README.md for ${repoName}:`, e);
    }
  }

  // 3. Try remote SKILL.md
  const remoteSkillUrl = `${remoteBaseUrl}/SKILL.md`;
  console.log(`Attempting to fetch remote SKILL.md for ${repoName} from ${remoteSkillUrl}`);
  const remoteSkill = await fetchUrl(remoteSkillUrl);
  if (remoteSkill) {
    console.log(`Successfully fetched remote SKILL.md for ${repoName}`);
    return remoteSkill;
  }

  // 4. Try remote README.md
  const remoteReadmeUrl = `${remoteBaseUrl}/README.md`;
  console.log(`Attempting to fetch remote README.md for ${repoName} from ${remoteReadmeUrl}`);
  const remoteReadme = await fetchUrl(remoteReadmeUrl);
  if (remoteReadme) {
    console.log(`Successfully fetched remote README.md for ${repoName}`);
    return remoteReadme;
  }

  throw new Error(`Could not find README.md or SKILL.md for ${repoName} locally or remotely.`);
}

async function main() {
  const tools = [
    {
      repoName: 'skill-fuse',
      fileName: 'skill-fuse.md',
      frontmatter: `---
layout: tool
title: Skill Fuse
description: Zero-dependency developer tool for local skill composition and path generation
---

`
    },
    {
      repoName: 'gaia-operator',
      fileName: 'gaia-operator.md',
      frontmatter: `---
layout: tool
title: Gaia Operator
description: Platform interaction agent (CUA runtime) and task trace processor
---

`
    }
  ];

  const outputDir = path.resolve(__dirname, '../content/tools');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const tool of tools) {
    try {
      const docContent = await getRepoDoc(tool.repoName);
      const outputPath = path.join(outputDir, tool.fileName);
      fs.writeFileSync(outputPath, tool.frontmatter + docContent, 'utf-8');
      console.log(`Successfully ingested and saved doc to: ${outputPath}`);
    } catch (error) {
      console.error(`Failed to ingest docs for ${tool.repoName}:`, error);
      process.exit(1);
    }
  }
}

main();
