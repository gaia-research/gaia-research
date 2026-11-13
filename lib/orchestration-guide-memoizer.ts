/**
 * Module-level memoizer for expensive static Markdown AST/React node compilation.
 * 
 * Prevents redundant AST construction and KaTeX math parsing during concurrent
 * requests in Cloudflare Worker isolates.
 */
export interface Memoizer<T> {
  get: () => T;
  reset: () => void;
  getCompileCount: () => number;
}

export function createMarkdownMemoizer<T>(compiler: () => T): Memoizer<T> {
  let cached: T | null = null;
  let compileCount = 0;

  return {
    get(): T {
      if (!cached) {
        compileCount++;
        cached = compiler();
      }
      return cached;
    },
    reset(): void {
      cached = null;
    },
    getCompileCount(): number {
      return compileCount;
    },
  };
}
