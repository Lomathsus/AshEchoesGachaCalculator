import path from 'path'
import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      stores: path.resolve(__dirname, './src/renderer/stores'),
      root: path.resolve(__dirname, './'),
    },
  },
})
