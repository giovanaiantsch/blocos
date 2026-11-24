import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: [
        'src/generation/**',
        'src/persistence/**',
        'src/core/**',
        'src/missoes/**',
        'src/blocks/**',
      ],
      exclude: ['src/ui/**', 'tests/**'],
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reportsDirectory: 'coverage',
    },
  },
});
