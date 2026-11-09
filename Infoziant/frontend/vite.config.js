import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'axios'],
          charts: ['recharts'],
          icons: ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  // Proxy /api/* to the backend during development
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
