import * as fs from 'fs';
import * as crypto from 'crypto';
import { resolveRepoPath, getRelativePath } from './paths';

export interface FileMetadata {
  path: string;
  sha256: string;
  bytes: number;
  mtime: string;
}

/**
 * Calculates SHA256 hash, byte size, and modification time for a file.
 */
export function getFileMetadata(relPath: string): FileMetadata {
  const absPath = resolveRepoPath(relPath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`File does not exist: ${relPath}`);
  }

  const stats = fs.statSync(absPath);
  const fileBuffer = fs.readFileSync(absPath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  const sha256 = hashSum.digest('hex');

  return {
    path: getRelativePath(absPath).replace(/\\/g, '/'), // Use forward slashes for cross-platform compatibility in JSON
    sha256,
    bytes: stats.size,
    mtime: stats.mtime.toISOString(),
  };
}
