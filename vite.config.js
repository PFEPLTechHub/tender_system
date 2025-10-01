import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic'
  })],
  build: {
    sourcemap: true, // Enable source maps for better debugging
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  resolve: {
    dedupe: ['react', 'react-dom'] // Prevent multiple React copies
  }
})
