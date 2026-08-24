import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'node',
    include: [
      'lib/**/*.test.ts',
      'app/**/*.test.ts',
      'scripts/scout-bench/**/*.test.ts',
      'scripts/hell-heaven-bench/**/*.test.ts',
    ],
  },
});
