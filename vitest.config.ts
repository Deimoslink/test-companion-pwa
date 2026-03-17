import { defineConfig, mergeConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    alias: {
      '@ionic/core/components': new URL('./node_modules/@ionic/core/components/index.js', import.meta.url).pathname
    }
  }
});
