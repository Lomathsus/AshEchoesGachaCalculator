import { defineConfig } from 'vite'

import baseConfig from './vite.base.config'

// https://vitejs.dev/config
export default defineConfig({
  ...baseConfig,
  css: {
    postcss: {
      plugins: [
        require('tailwindcss')(),
        require('autoprefixer')(),
        // 其他插件...
      ],
    },
  },
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
