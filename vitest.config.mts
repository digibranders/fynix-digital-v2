import { defineConfig } from "vitest/config";

/**
 * Unit tests for pure server-side logic (tax computation, invoice numbering).
 * Node environment only: there are no component tests here, so no DOM shim or
 * React plugin is needed.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "components/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": import.meta.dirname,
    },
  },
});
