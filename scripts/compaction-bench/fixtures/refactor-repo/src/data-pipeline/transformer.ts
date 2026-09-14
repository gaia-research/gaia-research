import { FetchResult } from './fetcher';

export interface TransformResult {
  id: number;
  slug: string;
  sourceUrl: string;
  transformedAt: string;
}

export function transformData(
  fetchResult: FetchResult,
  callback: (err: Error | null, result?: TransformResult) => void
): void {
  setTimeout(() => {
    try {
      const parsed = JSON.parse(fetchResult.data);
      if (!parsed.name) {
        callback(new Error('Missing required field: name'));
        return;
      }
      callback(null, {
        id: parsed.id ?? Date.now(),
        slug: parsed.name.toLowerCase().replace(/\s+/g, '-'),
        sourceUrl: fetchResult.url,
        transformedAt: new Date().toISOString(),
      });
    } catch (e) {
      callback(new Error(`JSON parse failure: ${(e as Error).message}`));
    }
  }, 10);
}
