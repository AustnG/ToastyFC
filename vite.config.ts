import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ToastyFC/', // Ensures correct paths for subdirectory hosting.
  build: {
    outDir: 'docs', // Output directory remains 'docs'
    chunkSizeWarningLimit: 1000, // Optional: Increase
  }
});