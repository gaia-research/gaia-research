import * as fs from 'fs';
import * as path from 'path';
import { parseArgs } from './lib/args';
import { getFileMetadata } from './lib/hash';
import { getImageInfo } from './lib/image';
import { loadLedger, validateLedger, AssetEntry } from './lib/ledger';
import { resolveRepoPath } from './lib/paths';

function scanSourceFiles(directories: string[]): string[] {
  const files: string[] = [];
  function scan(dir: string) {
    const absDir = resolveRepoPath(dir);
    if (!fs.existsSync(absDir)) return;
    const entries = fs.readdirSync(absDir, { withFileTypes: true });
    for (const entry of entries) {
      const rel = path.join(dir, entry.name).replace(/\\/g, '/');
      if (entry.isDirectory()) {
        if (
          entry.name === 'assets' ||
          entry.name === 'node_modules' ||
          entry.name.startsWith('.') ||
          (dir === 'content' && entry.name === 'assets') // Skip content/assets
        ) {
          continue;
        }
        scan(rel);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.ts', '.tsx', '.js', '.jsx', '.html', '.css', '.md'].includes(ext)) {
          files.push(rel);
        }
      }
    }
  }

  for (const d of directories) {
    scan(d);
  }
  return files;
}

async function main() {
  const args = parseArgs();
  const strict = args.flags.strict || false;

  console.log(`Running asset ledger checks (strict: ${strict})...`);

  const ledger = loadLedger();
  const { errors: initialErrors, warnings: initialWarnings } = validateLedger(ledger, strict);

  const errors = [...initialErrors];
  const warnings = [...initialWarnings];

  // 1. Check for hash/dimension drift
  console.log('Checking for file drift...');
  for (const asset of ledger.assets) {
    const absPath = resolveRepoPath(asset.path);
    if (!fs.existsSync(absPath)) {
      // Missing file error already reported by validateLedger
      continue;
    }

    try {
      const currentMeta = getFileMetadata(asset.path);
      if (currentMeta.sha256 !== asset.sha256) {
        errors.push(`Drift detected: Asset "${asset.id}" has modified content on disk (ledger SHA: ${asset.sha256.slice(0, 8)}..., disk SHA: ${currentMeta.sha256.slice(0, 8)}...).`);
      }
      if (currentMeta.bytes !== asset.bytes) {
        errors.push(`Drift detected: Asset "${asset.id}" has modified size on disk (ledger: ${asset.bytes} bytes, disk: ${currentMeta.bytes} bytes).`);
      }

      // Check dimensions
      try {
        const currentDimensions = await getImageInfo(asset.path);
        if (
          currentDimensions.width !== asset.dimensions.width ||
          currentDimensions.height !== asset.dimensions.height
        ) {
          errors.push(`Drift detected: Asset "${asset.id}" has modified dimensions on disk (ledger: ${asset.dimensions.width}x${asset.dimensions.height}, disk: ${currentDimensions.width}x${currentDimensions.height}).`);
        }
      } catch (dimErr: any) {
        warnings.push(`Could not read dimensions on disk for "${asset.id}": ${dimErr.message}`);
      }
    } catch (err: any) {
      errors.push(`Error checking drift for asset "${asset.id}": ${err.message}`);
    }
  }

  // 2. Warn if reference assets are referenced in production-facing source files
  console.log('Checking for reference asset usage in source files...');
  const referenceAssets = ledger.assets.filter(a => a.status === 'reference');
  if (referenceAssets.length > 0) {
    // Scan standard directories: src, content, docs, layouts, etc.
    const sourceFiles = scanSourceFiles(['src', 'content', 'docs', '_layouts', '_includes']);
    for (const file of sourceFiles) {
      try {
        const fileContent = fs.readFileSync(resolveRepoPath(file), 'utf8');
        for (const refAsset of referenceAssets) {
          // Check for references using either id or path
          if (fileContent.includes(refAsset.id) || fileContent.includes(refAsset.path)) {
            warnings.push(`Warning: Reference-only asset "${refAsset.id}" (${refAsset.path}) is referenced in source file "${file}".`);
          }
        }
      } catch (err: any) {
        warnings.push(`Could not scan source file "${file}": ${err.message}`);
      }
    }
  }

  // Report results
  console.log('\n--- Check Results ---');
  if (warnings.length > 0) {
    console.log(`Warnings (${warnings.length}):`);
    for (const w of warnings) {
      console.log(`  [WARN] ${w}`);
    }
  }

  if (errors.length > 0) {
    console.error(`\x1b[31mErrors (${errors.length}):\x1b[0m`);
    for (const e of errors) {
      console.error(`  \x1b[31m[ERROR]\x1b[0m ${e}`);
    }
    console.error('\nAsset ledger checks FAILED.');
    process.exit(1);
  }

  console.log('\nAsset ledger checks PASSED successfully.');
}

main().catch(err => {
  console.error('Unhandled execution error:', err);
  process.exit(1);
});
