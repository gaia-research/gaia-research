import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// Resolve repo root relative to this file's location
const currentDir = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(fileURLToPath(import.meta.url));

const repoRoot = path.resolve(currentDir, '../../..');

export function getRepoRoot(): string {
  return repoRoot;
}

/**
 * Resolves a path relative to the repo root and prevents directory traversal attacks.
 */
export function resolveRepoPath(targetPath: string): string {
  const resolved = path.resolve(repoRoot, targetPath);
  // Ensure the target is within the repo root to prevent accidental writes outside
  if (!resolved.startsWith(repoRoot)) {
    throw new Error(`Access denied: Path "${targetPath}" resolves to "${resolved}" which is outside the repository root "${repoRoot}".`);
  }
  return resolved;
}

/**
 * Ensures that the directory for the given file or folder path exists.
 */
export function ensureDirExists(targetPath: string, isFile = false): void {
  const resolved = resolveRepoPath(targetPath);
  const dir = isFile ? path.dirname(resolved) : resolved;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Gets a relative path from the repo root for clean display/logging.
 */
export function getRelativePath(absolutePath: string): string {
  return path.relative(repoRoot, absolutePath);
}
