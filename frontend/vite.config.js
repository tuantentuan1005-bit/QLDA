// vite.config.js - Cấu hình Vite + Tailwind
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Plugin Tailwind tích hợp với Vite
  ],
  server: {
    port: 5173,
  },
})
