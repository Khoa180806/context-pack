import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Only run in-browser engine unit tests — CLI/SDK tests live in root test/
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
