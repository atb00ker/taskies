import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [pluginReact()],
  html: {
    favicon: './src/assets/images/icon/logo.png',
  },
  resolve: {
    alias: {
      '@': './src',
    },
  },
});
