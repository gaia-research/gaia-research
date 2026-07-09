import * as fs from 'fs';
import * as path from 'path';
import { parseArgs } from './lib/args';
import { getSharp } from './lib/image';
import { loadLedger, AssetEntry } from './lib/ledger';
import { resolveRepoPath, getRelativePath, ensureDirExists } from './lib/paths';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function main() {
  const args = parseArgs();
  const force = args.flags.force || false;
  const outPath = args.values.out || 'assets/workbench/contact-sheets/sheet.png';
  const absOut = resolveRepoPath(outPath);
  ensureDirExists(outPath, true);

  if (fs.existsSync(absOut) && !force) {
    console.error(`Error: Output file already exists: ${outPath}. Use --force to overwrite.`);
    process.exit(1);
  }

  // Filter criteria from CLI
  const statusFilter = args.values.status ? args.values.status.split(',').map(s => s.trim()) : ['candidate', 'approved'];
  const kindFilter = args.values.kind ? args.values.kind.split(',').map(k => k.trim()) : null;

  console.log(`Generating contact sheet...`);
  console.log(`Filters - status: [${statusFilter.join(', ')}], kind: [${kindFilter ? kindFilter.join(', ') : 'all'}]`);

  const ledger = loadLedger();
  const filteredAssets = ledger.assets.filter(asset => {
    // Check status
    if (!statusFilter.includes(asset.status)) {
      return false;
    }
    // Check kind
    if (kindFilter && !kindFilter.includes(asset.kind)) {
      return false;
    }
    // Ensure file exists
    if (!fs.existsSync(resolveRepoPath(asset.path))) {
      return false;
    }
    return true;
  });

  if (filteredAssets.length === 0) {
    console.log('No assets found matching filters.');
    process.exit(0);
  }

  console.log(`Processing ${filteredAssets.length} assets for layout...`);

  const sharp = await getSharp();
  const cards: Buffer[] = [];

  const cardWidth = 300;
  const cardHeight = 360;
  const thumbSize = 280;

  for (const asset of filteredAssets) {
    try {
      const absPath = resolveRepoPath(asset.path);
      
      // 1. Generate thumbnail buffer
      let thumbBuffer: Buffer;
      try {
        thumbBuffer = await sharp(absPath)
          .resize({ width: thumbSize, height: thumbSize, fit: 'inside' })
          .toBuffer();
      } catch (err: any) {
        console.warn(`Warning: Could not resize ${asset.path}: ${err.message}. Using placeholder.`);
        // Placeholder thumbnail
        thumbBuffer = await sharp({
          create: {
            width: thumbSize,
            height: thumbSize,
            channels: 4,
            background: { r: 40, g: 40, b: 40, alpha: 1 }
          }
        }).png().toBuffer();
      }

      const thumbMeta = await sharp(thumbBuffer).metadata();
      const thumbW = thumbMeta.width || thumbSize;
      const thumbH = thumbMeta.height || thumbSize;

      // Centering calculations
      const leftOffset = 10 + Math.round((thumbSize - thumbW) / 2);
      const topOffset = 10 + Math.round((thumbSize - thumbH) / 2);

      // Clean path for display
      const filename = path.basename(asset.path);
      const dimsStr = `${asset.dimensions.width}x${asset.dimensions.height}`;
      const bytesStr = formatBytes(asset.bytes);

      // 2. SVG metadata overlay
      // Escape special characters for SVG text XML
      const escapeXml = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
      
      const cleanId = escapeXml(asset.id);
      const cleanFilename = escapeXml(filename);
      const cleanKind = escapeXml(asset.kind);
      const cleanStatus = escapeXml(asset.status);

      // Status color styling matching Rimuru Blue / Milim Pink
      const statusColor = asset.status === 'approved' ? '#38bdf8' : '#ec4899';

      const svgCard = `
        <svg width="${cardWidth}" height="${cardHeight}" xmlns="http://www.w3.org/2000/svg">
          <rect width="${cardWidth}" height="${cardHeight}" fill="#171717" rx="8" ry="8" stroke="#262626" stroke-width="2"/>
          <rect x="8" y="8" width="284" height="284" fill="#0f0f0f" rx="6" ry="6"/>
          
          <text x="12" y="310" fill="${statusColor}" font-family="'Syne', 'Segoe UI', sans-serif" font-size="13" font-weight="bold">${cleanId}</text>
          <text x="12" y="326" fill="#a3a3a3" font-family="'Segoe UI', sans-serif" font-size="10">${cleanFilename}</text>
          <text x="12" y="340" fill="#737373" font-family="'Segoe UI', sans-serif" font-size="10">Kind: ${cleanKind} | Res: ${dimsStr} (${bytesStr})</text>
          <text x="12" y="352" fill="#737373" font-family="'Segoe UI', sans-serif" font-size="10">Status: ${cleanStatus}</text>
        </svg>
      `;

      // 3. Composite thumbnail onto card base
      const card = await sharp(Buffer.from(svgCard))
        .composite([{ input: thumbBuffer, top: topOffset, left: leftOffset }])
        .png()
        .toBuffer();

      cards.push(card);
    } catch (err: any) {
      console.error(`Error rendering card for "${asset.id}": ${err.message}`);
    }
  }

  if (cards.length === 0) {
    console.error('No card buffers successfully generated.');
    process.exit(1);
  }

  // 4. Lay out cards on a grid
  const columns = 4;
  const rows = Math.ceil(cards.length / columns);
  const padding = 20;

  const sheetWidth = columns * cardWidth + (columns + 1) * padding;
  const sheetHeight = rows * cardHeight + (rows + 1) * padding;

  console.log(`Sheet layout: ${columns} columns x ${rows} rows (${sheetWidth}x${sheetHeight}px).`);

  const compositions = cards.map((card, i) => {
    const r = Math.floor(i / columns);
    const c = i % columns;
    return {
      input: card,
      left: padding + c * (cardWidth + padding),
      top: padding + r * (cardHeight + padding)
    };
  });

  // Create obsidian background and composite cards
  await sharp({
    create: {
      width: sheetWidth,
      height: sheetHeight,
      channels: 4,
      background: { r: 10, g: 10, b: 10, alpha: 1 } // #0a0a0a
    }
  })
    .composite(compositions)
    .png()
    .toFile(absOut);

  console.log(`\nContact sheet successfully written to: ${outPath}`);
}

main().catch(err => {
  console.error('Unhandled execution error:', err);
  process.exit(1);
});
