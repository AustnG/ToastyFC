import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative paths for assets, good for GitHub Pages subdirectory hosting.
  build: {
    outDir: 'docs', // Changed output directory to 'docs'
    chunkSizeWarningLimit: 1000, // Optional: Increase