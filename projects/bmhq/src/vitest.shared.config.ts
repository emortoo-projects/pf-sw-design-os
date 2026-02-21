// vitest.shared.config.ts
// Drop this in the monorepo root — each workspace extends it
// Usage in workspace: import { mergeConfig } from 'vitest/config'

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov', 'json-summary', 'html'],
      reportsDirectory: './coverage',

      // Thresholds — fail CI if coverage drops below these
      thresholds: {
        lines: 60,
        functions: 55,
        branches: 50,
        statements: 60,
      },

      // What to include/exclude
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/**/__tests__/**',
        'src/**/__mocks__/**',
        'src/**/types/**',
        'src/**/index.ts', // barrel exports
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],

      // Don't count these toward coverage
      skipFull: false,
      clean: true,
    },

    // Test configuration
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],

    // Performance
    pool: 'forks',
    maxConcurrency: 10,

    // Reporter
    reporters: ['default', 'json'],
    outputFile: {
      json: './test-results.json',
    },
  },
});
