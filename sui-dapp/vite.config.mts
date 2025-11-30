import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Absolute paths for proper routing
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Fix poseidon-lite subpath exports
      'poseidon-lite': path.resolve(__dirname, 'node_modules/poseidon-lite/index.js'),
    },
    dedupe: ['@mysten/sui', 'poseidon-lite'], // Prevent multiple versions
  },
  server: {
    headers: {
      // Fix COOP error for Enoki OAuth popups
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
  },
  build: {
    // Production optimizations
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: undefined, // Let Vite handle chunking automatically
      },
    },
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    include: ['@mysten/dapp-kit', '@mysten/enoki', 'poseidon-lite'], // Force pre-bundle poseidon-lite
    exclude: ['@mysten/sui'], // Exclude problematic packages
    esbuildOptions: {
      target: 'esnext',
      supported: {
        'top-level-await': true,
      },
    },
  },
});
