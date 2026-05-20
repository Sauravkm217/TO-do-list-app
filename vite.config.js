import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Optimize dependencies upfront so first page load is instant
  optimizeDeps: {
    include: ['react', 'react-dom', 'canvas-confetti', 'lucide-react'],
  },
  server: {
    hmr: true,
  },
})
