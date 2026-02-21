import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    globals: true,
    pool: "forks",
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "lcov", "json-summary", "html"],
      reportsDirectory: "./coverage",
      thresholds: {
        lines: 60,
        functions: 55,
        branches: 50,
        statements: 60,
      },
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.test.{ts,tsx}",
        "src/**/*.spec.{ts,tsx}",
        "src/**/__tests__/**",
        "src/**/__mocks__/**",
        "src/**/types/**",
        "src/**/index.ts",
        "src/main.tsx",
        "src/vite-env.d.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
