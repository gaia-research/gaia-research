import * as fs from 'fs';
import * as path from 'path';
import { parseArgs } from './lib/args';
import { getFileMetadata } from './lib/hash';
import { getImageInfo } from './lib/image';
import { loadLedger, saveLedger, AssetEntry, AssetLedger } from './lib/ledger';
import { resolveRepoPath, getRelativePath } from './lib/paths';

function generateAssetId(relPath: string): string {
  const norm = relPath.replace(/\\/g, '/');
  const filename = norm.split('/').pop() || '';
  const dotIndex = filename.lastIndexOf('.');
  const baseName = dotIndex === -1 ? filename : filename.substring(0, dotIndex);

  if (norm.startsWith('assets/brand/')) {
    const sub = norm.replace(/^assets\/brand\//, '');
    const subDot = sub.lastIndexOf('.');
    const subNoExt = subDot === -1 ? sub : sub.substring(0, subDot);
    const slug = subNoExt.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (slug.startsWith('ui-') || slug.startsWith('logo-') || slug.startsWith('icon-')) {
      return slug;
    }
    if (!subNoExt.includes('/')) {
      return baseName.toLowerCase();
    }
    return `brand-${slug}`;
  }

  // Handle North Star references cleanly
  if (baseName.startsWith('North Star - ')) {
    return baseName.replace('North Star - ', '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  return baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function inferKind(relPath: string): string {
  const norm = relPath.toLowerCase();
  if (norm.includes('/logo/')) return 'logo';
  if (norm.includes('/icon/') || norm.includes('/icons/')) return 'icon';
  if (norm.includes('/decorations/')) return 'vector-decoration';
  if (norm.includes('/badges/')) return 'badge';
  if (norm.includes('avatar')) return 'avatar';
  if (norm.includes('hero')) return 'hero-illustration';
  if (norm.includes('og') || norm.includes('preview')) return 'og-image';
  if (norm.includes('north star')) return 'reference-comp';
  return 'illustration';
}

function scanDirectory(dir: string, fileList: string[] = []): string[] {
  const absDir = resolveRepoPath(dir);
  if (!fs.existsSync(absDir)) return fileList;

  const entries = fs.readdirSync(absDir, { withFileTypes: true });
  for (const entry of entries) {
    const relPath = path.join(dir, entry.name).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (entry.name === 'workbench' || entry.name === 'node_modules' || entry.name.startsWith('.')) {
        continue;
      }
      scanDirectory(relPath, fileList);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg'].includes(ext)) {
        fileList.push(relPath);
      }
    }
  }
  return fileList;
}

async function main() {
  const args = parseArgs();
  const scanDir = args.values.scan || 'assets';
  console.log(`Scanning directory: "${scanDir}"...`);

  const files = scanDirectory(scanDir);
  console.log(`Found ${files.length} candidate asset files.`);

  const ledger = loadLedger();
  const updatedAssets: AssetEntry[] = [];
  const existingAssetsMap = new Map<string, AssetEntry>();

  // Map existing assets by path for quick lookup
  for (const asset of ledger.assets) {
    existingAssetsMap.set(asset.path.replace(/\\/g, '/'), asset);
  }

  // Pre-calculate ID collisions
  const idCollisionMap = new Map<string, string[]>();
  for (const file of files) {
    const baseId = generateAssetId(file);
    if (!idCollisionMap.has(baseId)) {
      idCollisionMap.set(baseId, []);
    }
    idCollisionMap.get(baseId)!.push(file);
  }

  for (const file of files) {
    try {
      const baseId = generateAssetId(file);
      let id = baseId;
      const collisionFiles = idCollisionMap.get(baseId) || [];
      if (collisionFiles.length > 1) {
        const ext = path.extname(file).toLowerCase().replace('.', '');
        id = `${baseId}-${ext}`;
      }

      const meta = getFileMetadata(file);
      let width = 0;
      let height = 0;


      // Try reading dimensions using sharp
      try {
        const info = await getImageInfo(file);
        width = info.width;
        height = info.height;
      } catch (err: any) {
        // SVG files might occasionally fail or have special characteristics, log warning
        console.warn(`Warning: Could not extract dimensions for ${file}: ${err.message}`);
      }

      // Check if it's an obvious reference status
      const isRef = file.toLowerCase().includes('north star') || file.toLowerCase().includes('/figma/');
      const defaultStatus = isRef ? 'reference' : 'candidate';
      const defaultSource = file.startsWith('assets/generated/')
        ? 'generated'
        : file.startsWith('assets/brand/')
        ? 'brand'
        : 'source';

      const existing = existingAssetsMap.get(file);

      const assetEntry: AssetEntry = {
        id: existing?.id || id,
        path: file,
        kind: existing?.kind || inferKind(file),
        status: existing?.status || defaultStatus as any,
        sourceType: existing?.sourceType || defaultSource,
        license: existing?.license || 'internal-review-required',
        credit: existing?.credit || 'Gaia Research asset workflow',
        alt: existing?.alt || '',
        sha256: meta.sha256,
        bytes: meta.bytes,
        dimensions: { width, height },
        derivatives: existing?.derivatives || [],
        notes: existing?.notes || undefined,
      };

      updatedAssets.push(assetEntry);
    } catch (err: any) {
      console.error(`Error processing asset file ${file}: ${err.message}`);
    }
  }

  // Preserve existing assets that were not scanned (e.g. if scan was restricted)
  // but if scanning full assets dir, remove any assets from ledger that are no longer on disk.
  if (scanDir === 'assets') {
    const scannedSet = new Set(files);
    for (const asset of ledger.assets) {
      if (!scannedSet.has(asset.path.replace(/\\/g, '/'))) {
        console.log(`Removing stale asset from ledger: "${asset.id}" (file not found on disk at "${asset.path}")`);
      }
    }
  }

  // Save the updated ledger
  ledger.assets = updatedAssets;
  saveLedger(ledger);
  console.log(`Synced ${updatedAssets.length} assets to content/assets/asset-ledger.json.`);
}

main().catch(err => {
  console.error('Unhandled execution error:', err);
  process.exit(1);
});
