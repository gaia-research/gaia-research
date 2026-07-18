import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/craft/**/*.test.ts', 'lib/mcp/**/*.test.ts', 'lib/milim-*.test.ts'],
  },
});
