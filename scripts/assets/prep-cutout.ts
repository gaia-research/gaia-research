import * as fs from 'fs';
import { parseArgs, requireOption } from './lib/args';
import { getSharp } from './lib/image';
import { resolveRepoPath, getRelativePath, ensureDirExists } from './lib/paths';

async function main() {
  const args = parseArgs();
  const inputPath = requireOption(args.values, 'input', 'Usage: --input <file> [--out <dir_and_prefix>] [--key <hex>] [--sample-corners] [--tolerance <num>] [--feather <num>] [--force]');
  
  const absInput = resolveRepoPath(inputPath);
  if (!fs.existsSync(absInput)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const outPrefix = args.values.out || `assets/workbench/cutouts/${inputPath.split('/').pop()?.split('.')[0] || 'cutout'}`;
  const absOutPrefix = resolveRepoPath(outPrefix);
  ensureDirExists(outPrefix, true);

  const force = args.flags.force || false;
  
  // Check if output files exist and prevent overwrite unless force is passed
  const suffixes = ['cutout.png', 'mask.png', 'preview.png', 'normalized.png'];
  const existingFiles = suffixes
    .map(s => `${absOutPrefix}-${s}`)
    .filter(p => fs.existsSync(p));

  if (existingFiles.length > 0 && !force) {
    console.error(`\x1b[31mError: Target file(s) already exist:\x1b[0m`);
    for (const f of existingFiles) {
      console.error(`  - ${getRelativePath(f)}`);
    }
    console.error('Use --force flag to overwrite.');
    process.exit(1);
  }

  const sharp = await getSharp();
  
  // Load image details and raw pixel data
  const pipeline = sharp(absInput);
  const metadata = await pipeline.metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;
  
  const { data: rawBuffer, info } = await pipeline
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  
  // Helper to get pixel RGB
  const getPixel = (x: number, y: number) => {
    const idx = (y * width + x) * channels;
    return {
      r: rawBuffer[idx],
      g: rawBuffer[idx + 1],
      b: rawBuffer[idx + 2],
    };
  };

  // Determine chroma key color
  let keyR = 0;
  let keyG = 255;
  let keyB = 0; // Default green key

  if (args.values.key) {
    const hex = args.values.key.replace('#', '');
    if (hex.length === 6) {
      keyR = parseInt(hex.substring(0, 2), 16);
      keyG = parseInt(hex.substring(2, 4), 16);
      keyB = parseInt(hex.substring(4, 6), 16);
    } else {
      console.warn(`Warning: Invalid key color format "${args.values.key}". Using default green.`);
    }
  }

  if (args.flags['sample-corners']) {
    const corners = [
      getPixel(0, 0),
      getPixel(width - 1, 0),
      getPixel(0, height - 1),
      getPixel(width - 1, height - 1),
    ];
    keyR = Math.round(corners.reduce((sum, p) => sum + p.r, 0) / 4);
    keyG = Math.round(corners.reduce((sum, p) => sum + p.g, 0) / 4);
    keyB = Math.round(corners.reduce((sum, p) => sum + p.b, 0) / 4);
    console.log(`Estimated key color from corners: rgb(${keyR}, ${keyG}, ${keyB})`);
  }

  const tolerance = args.values.tolerance ? parseInt(args.values.tolerance, 10) : 34;
  const feather = args.values.feather ? parseInt(args.values.feather, 10) : 2;

  console.log(`Running chroma-key prep (key: rgb(${keyR},${keyG},${keyB}), tolerance: ${tolerance}, feather: ${feather})...`);

  // Create buffers for cutout (RGBA) and matte mask (Grayscale)
  const cutoutBuffer = Buffer.alloc(width * height * 4);
  const maskBuffer = Buffer.alloc(width * height);
  const checkerboardBuffer = Buffer.alloc(width * height * 4);

  const checkerboardSize = 16;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * channels;
      const r = rawBuffer[srcIdx];
      const g = rawBuffer[srcIdx + 1];
      const b = rawBuffer[srcIdx + 2];
      
      // Calculate euclidean distance in RGB space
      const dist = Math.sqrt((r - keyR) ** 2 + (g - keyG) ** 2 + (b - keyB) ** 2);
      
      let alpha = 255;
      if (dist < tolerance) {
        alpha = 0;
      } else if (dist < tolerance + feather) {
        const ratio = (dist - tolerance) / feather;
        alpha = Math.floor(ratio * 255);
      }

      // 1. Cutout pixel (RGBA)
      const dstIdx = (y * width + x) * 4;
      cutoutBuffer[dstIdx] = r;
      cutoutBuffer[dstIdx + 1] = g;
      cutoutBuffer[dstIdx + 2] = b;
      cutoutBuffer[dstIdx + 3] = alpha;

      // 2. Matte mask (Grayscale)
      const maskIdx = y * width + x;
      maskBuffer[maskIdx] = alpha;

      // 3. Checkerboard preview background pixel
      const isDark = (Math.floor(x / checkerboardSize) + Math.floor(y / checkerboardSize)) % 2 === 0;
      const cbBg = isDark ? 200 : 255;

      // Composite cutout on top of checkerboard background
      const normAlpha = alpha / 255;
      checkerboardBuffer[dstIdx] = Math.round(r * normAlpha + cbBg * (1 - normAlpha));
      checkerboardBuffer[dstIdx + 1] = Math.round(g * normAlpha + cbBg * (1 - normAlpha));
      checkerboardBuffer[dstIdx + 2] = Math.round(b * normAlpha + cbBg * (1 - normAlpha));
      checkerboardBuffer[dstIdx + 3] = 255;
    }
  }

  // Save the four files
  const cutoutPath = `${absOutPrefix}-cutout.png`;
  const maskPath = `${absOutPrefix}-mask.png`;
  const previewPath = `${absOutPrefix}-preview.png`;
  const normPath = `${absOutPrefix}-normalized.png`;

  await sharp(cutoutBuffer, { raw: { width, height, channels: 4 } }).png().toFile(cutoutPath);
  await sharp(maskBuffer, { raw: { width, height, channels: 1 } }).png().toFile(maskPath);
  await sharp(checkerboardBuffer, { raw: { width, height, channels: 4 } }).png().toFile(previewPath);
  
  // Write the normalized input image as standard PNG
  await sharp(absInput).png().toFile(normPath);

  console.log(`\nPrep cutout completed successfully:`);
  console.log(`  - Cutout: ${getRelativePath(cutoutPath)}`);
  console.log(`  - Matte Mask: ${getRelativePath(maskPath)}`);
  console.log(`  - Preview: ${getRelativePath(previewPath)}`);
  console.log(`  - Normalized: ${getRelativePath(normPath)}`);
}

main().catch(err => {
  console.error('Unhandled execution error:', err);
  process.exit(1);
});
