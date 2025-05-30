import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/parentFaces/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          // Split face-api.js into its own chunk for better caching
          'face-api': ['face-api.js'],
          // Split transformers.js into its own chunk (for future use)
          'transformers': ['@xenova/transformers'],
          // Split React libraries
          'react-vendor': ['react', 'react-dom'],
          // Split other vendor libraries
          'vendor': ['react-dropzone']
        }
      }
    },
    // Increase chunk size warning limit since ML libraries are naturally large
    chunkSizeWarningLimit: 1000
  }
})
