import * as fs from 'fs';
import * as path from 'path';
import { parseArgs, requireOption } from './lib/args';
import { getFileMetadata } from './lib/hash';
import { exportImage, getImageInfo } from './lib/image';
import { loadLedger, saveLedger } from './lib/ledger';
import { resolveRepoPath, getRelativePath, ensureDirExists } from './lib/paths';

interface ExportRecipeItem {
  suffix: string;
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: string;
  formats: ('png' | 'webp' | 'avif' | 'jpeg' | 'jpg')[];
  quality?: number;
}

interface ExportRecipe {
  assetId: string;
  exports: ExportRecipeItem[];
}

async function handleExport({
  inputPath,
  outputPathWithoutExt,
  width,
  height,
  fit,
  position,
  formats,
  quality,
  force,
  assetId,
}: {
  inputPath: string;
  outputPathWithoutExt: string;
  width?: number;
  height?: number;
  fit?: any;
  position?: string;
  formats: any[];
  quality?: number;
  force: boolean;
  assetId?: string;
}): Promise<string[]> {
  const absInput = resolveRepoPath(inputPath);
  if (!fs.existsSync(absInput)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  // Ensure output directory exists
  ensureDirExists(outputPathWithoutExt, true);

  // Check if any of the target files exist and prevent overwrite unless force is true
  const existingFiles: string[] = [];
  for (const format of formats) {
    const fileExt = format === 'jpeg' ? 'jpg' : format;
    const finalOutPath = resolveRepoPath(`${outputPathWithoutExt}.${fileExt}`);
    if (fs.existsSync(finalOutPath) && !force) {
      existingFiles.push(getRelativePath(finalOutPath));
    }
  }

  if (existingFiles.length > 0) {
    console.error(`\x1b[31mError: Target file(s) already exist:\x1b[0m`);
    for (const f of existingFiles) {
      console.error(`  - ${f}`);
    }
    console.error('Use --force flag to overwrite.');
    process.exit(1);
  }

  console.log(`Exporting "${inputPath}" to formats [${formats.join(', ')}]...`);
  const exportedAbsolutePaths = await exportImage({
    inputPath,
    outputPathWithoutExt,
    width,
    height,
    fit,
    position,
    formats,
    quality,
  });

  const relativeOutputs = exportedAbsolutePaths.map(p => getRelativePath(p).replace(/\\/g, '/'));

  // Read source info for manifest
  const sourceMeta = getFileMetadata(inputPath);
  const sourceDimensions = await getImageInfo(inputPath);

  // Generate manifest contents
  const manifestPath = resolveRepoPath(`${outputPathWithoutExt}.manifest.json`);
  const manifest = {
    source: {
      path: getRelativePath(absInput).replace(/\\/g, '/'),
      sha256: sourceMeta.sha256,
      dimensions: sourceDimensions,
    },
    exports: relativeOutputs.map(relOut => {
      const outMeta = getFileMetadata(relOut);
      return {
        path: relOut,
        format: path.extname(relOut).slice(1),
        width,
        height,
        fit: fit || 'cover',
        position: position || 'attention',
        quality: quality || 80,
        sha256: outMeta.sha256,
        bytes: outMeta.bytes,
      };
    }),
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`Wrote sidecar manifest to: ${getRelativePath(manifestPath)}`);

  // Update ledger if assetId is provided
  if (assetId) {
    const ledger = loadLedger();
    const asset = ledger.assets.find(a => a.id === assetId || a.path === inputPath);
    if (asset) {
      // Add derivatives to ledger, keeping them unique
      const currentDerivatives = new Set(asset.derivatives || []);
      for (const out of relativeOutputs) {
        currentDerivatives.add(out);
      }
      asset.derivatives = Array.from(currentDerivatives);
      saveLedger(ledger);
      console.log(`Updated ledger asset "${asset.id}" with ${relativeOutputs.length} derivatives.`);
    }
  }

  return relativeOutputs;
}

async function main() {
  const args = parseArgs();
  const force = args.flags.force || false;

  // Recipe Mode
  if (args.values.recipe) {
    const recipeFilePath = args.values.recipe;
    const assetId = requireOption(args.values, 'asset', 'Usage in recipe mode: --recipe <recipes.json> --asset <assetId>');

    const absRecipePath = resolveRepoPath(recipeFilePath);
    if (!fs.existsSync(absRecipePath)) {
      console.error(`Recipe file not found: ${recipeFilePath}`);
      process.exit(1);
    }

    const recipeData = JSON.parse(fs.readFileSync(absRecipePath, 'utf8'));
    const recipe: ExportRecipe = recipeData.recipes?.[assetId];
    if (!recipe) {
      console.error(`Recipe for asset ID "${assetId}" not found in ${recipeFilePath}.`);
      process.exit(1);
    }

    // Load ledger to find the source asset path
    const ledger = loadLedger();
    let asset = ledger.assets.find(a => a.id === recipe.assetId || a.id === assetId);
    if (!asset) {
      // Fallback: look for ids starting with the target id (e.g. milim-avatar-png)
      asset = ledger.assets.find(a => a.id.startsWith(recipe.assetId) || a.id.startsWith(assetId));
    }
    if (!asset) {
      console.error(`Asset "${assetId}" (or "${recipe.assetId}") not found in asset ledger.`);
      process.exit(1);
    }

    const outDir = args.values.outDir || `assets/workbench/exports/${assetId}`;

    console.log(`Running recipe "${assetId}" for asset path "${asset.path}"...`);
    for (const exp of recipe.exports) {
      const outputPathWithoutExt = `${outDir}/${assetId}-${exp.suffix}`;
      await handleExport({
        inputPath: asset.path,
        outputPathWithoutExt,
        width: exp.width,
        height: exp.height,
        fit: exp.fit,
        position: exp.position,
        formats: exp.formats,
        quality: exp.quality,
        force,
        assetId: asset.id,
      });
    }
    console.log(`Recipe execution completed.`);
  }
  // Direct Mode
  else if (args.values.input) {
    const inputPath = args.values.input;
    const outPathWithoutExt = requireOption(
      args.values,
      'out',
      'Usage in direct mode: --input <file> --out <file_prefix> --width <w> --height <h> --formats <csv> [--fit <fit>] [--position <pos>]'
    );
    const width = args.values.width ? parseInt(args.values.width, 10) : undefined;
    const height = args.values.height ? parseInt(args.values.height, 10) : undefined;
    const fit = (args.values.fit as any) || 'cover';
    const position = args.values.position;
    const formatsCsv = requireOption(args.values, 'formats', 'Formats must be a comma-separated list, e.g. webp,png');
    const formats = formatsCsv.split(',').map(f => f.trim()) as any[];
    const quality = args.values.quality ? parseInt(args.values.quality, 10) : undefined;

    await handleExport({
      inputPath,
      outputPathWithoutExt: outPathWithoutExt,
      width,
      height,
      fit,
      position,
      formats,
      quality,
      force,
    });
    console.log(`Direct export completed.`);
  } else {
    console.error('Usage:');
    console.error('  Recipe Mode:');
    console.error('    npx tsx scripts/assets/export-responsive.ts --recipe <recipes.json> --asset <assetId> [--outDir <dir>] [--force]');
    console.error('  Direct Mode:');
    console.error('    npx tsx scripts/assets/export-responsive.ts --input <file> --out <prefix> --width <w> --height <h> --formats <csv> [--force]');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Unhandled execution error:', err);
  process.exit(1);
});
