import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { softwareMarkdown } from './build/softwareMarkdown.ts'

export default defineConfig(({ command }) => {
  return {
    base: command === 'build' ? './' : '/',
    plugins: [softwareMarkdown(), vue()],
    ssgOptions: {
      dirStyle: 'nested',
      // Vue already condenses templates. A second whitespace pass changes text
      // nodes and defeats deterministic hydration of the generated HTML.
      formatting: 'none',
    },
  }
})
