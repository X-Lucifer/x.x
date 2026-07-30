import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command }) => {
  return {
    base: command === 'build' ? './' : '/',
    plugins: [vue()],
    ssgOptions: {
      dirStyle: 'nested',
      formatting: 'minify',
    },
  }
})
