import { defineConfig } from 'vite'

// https://vitejs.dev/config
export default defineConfig({
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
