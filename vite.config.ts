import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// Determine appropriate base URL for GitHub Pages, docs folder, or local preview
const getBaseUrl = (): string => {
  let base = process.env.BASE_URL || process.env.VITE_BASE;
  if (base) {
    if (!base.endsWith('/') && !base.startsWith('.')) {
      base = base + '/';
    }
    return base;
  }

  if (process.env.GITHUB_REPOSITORY) {
    const parts = process.env.GITHUB_REPOSITORY.split('/');
    const repo = parts[1];
    if (repo) {
      if (repo.toLowerCase().endsWith('.github.io')) {
        return '/';
      }
      return `/${repo}/`;
    }
  }

  return './';
};

export default defineConfig(() => {
  return {
    base: getBaseUrl(),
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
