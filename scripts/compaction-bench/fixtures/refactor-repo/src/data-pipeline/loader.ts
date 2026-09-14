import { TransformResult } from './transformer';

export interface LoadResult {
  insertedId: number;
  table: string;
  success: boolean;
}

export function loadRecord(
  tableName: string,
  record: TransformResult,
  callback: (err: Error | null, result?: LoadResult) => void
): void {
  setTimeout(() => {
    if (!tableName) {
      callback(new Error('Missing destination table name'));
      return;
    }
    if (record.id < 0) {
      callback(new Error(`Duplicate key violation in table ${tableName}: ${record.id}`));
      return;
    }
    callback(null, {
      insertedId: record.id,
      table: tableName,
      success: true,
    });
  }, 10);
}
