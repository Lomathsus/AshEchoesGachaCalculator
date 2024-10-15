import { defineConfig } from 'vite'

import baseConfig from './vite.base.config'

// https://vitejs.dev/config
export default defineConfig({
  ...baseConfig,
  server: {
    proxy: {
      '/api': {
        target: 'https://seed.qq.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },

      '/gacha': {
        target: 'https://apps.game.qq.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gacha/, ''),
      },
    },
  },
})
