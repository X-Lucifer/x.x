import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { softwareMarkdown } from './build/softwareMarkdown.ts'

export default defineConfig(({ command }) => {
  return {
    base: command === 'build' ? './' : '/',
    plugins: [softwareMarkdown(), vue()],
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                // Keep Three's core separate from its WebGL renderer. Both stay
                // behind the scene imports and are shared by the two canvases.
                name: 'three-core',
                test: /[/\\]three[/\\]build[/\\]three\.core\.js$/,
                includeDependenciesRecursively: false,
              },
            ],
          },
        },
      },
    },
    ssgOptions: {
      dirStyle: 'nested',
      // Vue already condenses templates. A second whitespace pass changes text
      // nodes and defeats deterministic hydration of the generated HTML.
      formatting: 'none',
    },
  }
})
