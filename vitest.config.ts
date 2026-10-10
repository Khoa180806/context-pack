import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Only run CLI & SDK tests at root — web engine tests live in web/
    include: ['test/**/*.test.ts'],
    environment: 'node',
  },
});
