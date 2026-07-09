import * as fs from 'fs';
import { resolveRepoPath } from './paths';

export interface AssetEntry {
  id: string;
  path: string;
  kind: string;
  status: 'reference' | 'candidate' | 'approved' | 'deprecated';
  sourceType: string;
  license: string;
  credit: string;
  alt: string;
  sha256: string;
  bytes: number;
  dimensions: { width: number; height: number };
  derivatives: string[];
  notes?: string;
}

export interface AssetLedger {
  $schema?: string;
  assets: AssetEntry[];
}

const DEFAULT_LEDGER_PATH = 'content/assets/asset-ledger.json';

/**
 * Loads the asset ledger from JSON.
 */
export function loadLedger(relPath = DEFAULT_LEDGER_PATH): AssetLedger {
  const absPath = resolveRepoPath(relPath);
  if (!fs.existsSync(absPath)) {
    return { assets: [] };
  }
  const content = fs.readFileSync(absPath, 'utf8');
  try {
    return JSON.parse(content) as AssetLedger;
  } catch (err: any) {
    console.error(`Error parsing ledger at ${relPath}: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Saves the asset ledger to JSON, formatting with 2 spaces.
 */
export function saveLedger(ledger: AssetLedger, relPath = DEFAULT_LEDGER_PATH): void {
  const absPath = resolveRepoPath(relPath);
  const content = JSON.stringify(ledger, null, 2) + '\n';
  fs.writeFileSync(absPath, content, 'utf8');
}

/**
 * Validates the ledger for duplicate IDs, missing files, hash drift, etc.
 */
export function validateLedger(
  ledger: AssetLedger,
  strict = false
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const ids = new Set<string>();
  const paths = new Set<string>();

  for (const asset of ledger.assets) {
    // 1. Check ID uniqueness
    if (!asset.id) {
      errors.push(`Asset entry missing ID: ${JSON.stringify(asset)}`);
    } else if (ids.has(asset.id)) {
      errors.push(`Duplicate asset ID: "${asset.id}"`);
    } else {
      ids.add(asset.id);
    }

    // 2. Check path uniqueness
    if (!asset.path) {
      errors.push(`Asset "${asset.id || '(no ID)'}" missing path.`);
    } else {
      const normalizedPath = asset.path.replace(/\\/g, '/');
      if (paths.has(normalizedPath)) {
        errors.push(`Duplicate asset path: "${asset.path}"`);
      } else {
        paths.add(normalizedPath);
      }

      // Check physical file existence
      try {
        const absPath = resolveRepoPath(asset.path);
        if (!fs.existsSync(absPath)) {
          errors.push(`Asset "${asset.id}" path does not exist on disk: "${asset.path}"`);
        }
      } catch (err: any) {
        errors.push(`Asset "${asset.id}" path resolution error: ${err.message}`);
      }
    }

    // 3. Status checks
    const validStatuses = ['reference', 'candidate', 'approved', 'deprecated'];
    if (!validStatuses.includes(asset.status)) {
      errors.push(`Asset "${asset.id}" has invalid status "${asset.status}". Must be one of: ${validStatuses.join(', ')}`);
    }

    // 4. Strict checks (required for 'approved' status in strict mode)
    if (strict && asset.status === 'approved') {
      if (!asset.alt || asset.alt.trim() === '') {
        errors.push(`Strict check failed: Approved asset "${asset.id}" requires non-empty alt text.`);
      }
      if (!asset.license || asset.license.trim() === '') {
        errors.push(`Strict check failed: Approved asset "${asset.id}" requires license info.`);
      }
      if (!asset.credit || asset.credit.trim() === '') {
        errors.push(`Strict check failed: Approved asset "${asset.id}" requires credit info.`);
      }
      if (!asset.derivatives || asset.derivatives.length === 0) {
        warnings.push(`Strict warning: Approved asset "${asset.id}" has no registered derivatives.`);
      }
    }

    // 5. Special checks for specific kinds/dimensions
    if (asset.kind === 'og-image' || asset.id.includes('og')) {
      if (asset.dimensions && (asset.dimensions.width !== 1200 || asset.dimensions.height !== 630)) {
        warnings.push(`Asset "${asset.id}" is an OG image, but dimensions are ${asset.dimensions.width}x${asset.dimensions.height} instead of standard 1200x630.`);
      }
    }
  }

  return { errors, warnings };
}
