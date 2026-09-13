import { fetchUrl, FetchResult } from './fetcher';
import { transformData, TransformResult } from './transformer';
import { loadRecord, LoadResult } from './loader';

export interface PipelineConfig {
  url: string;
  tableName: string;
}

export function runPipeline(
  config: PipelineConfig,
  callback: (err: Error | null, result?: { fetch: FetchResult; transform: TransformResult; load: LoadResult }) => void
): void {
  // Nested callback hell
  fetchUrl(config.url, (fetchErr, fetchRes) => {
    if (fetchErr || !fetchRes) {
      callback(fetchErr ?? new Error('Fetch failed'));
      return;
    }

    transformData(fetchRes, (transErr, transRes) => {
      if (transErr || !transRes) {
        callback(transErr ?? new Error('Transform failed'));
        return;
      }

      loadRecord(config.tableName, transRes, (loadErr, loadRes) => {
        if (loadErr || !loadRes) {
          callback(loadErr ?? new Error('Load failed'));
          return;
        }

        callback(null, {
          fetch: fetchRes,
          transform: transRes,
          load: loadRes,
        });
      });
    });
  });
}
