import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  plugins: [
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart({
      customViteReactPlugin: true,
      target: "cloudflare-module"
    }),
    viteReact(),
  ],
  assetsInclude: ['**/*.riv'],
  ssr: {
    external: ['sqlite', 'wrangler', '@tanstack/react-devtools', '@tanstack/devtools'],
  },
  optimizeDeps: {
    exclude: ['wrangler', 'sqlite']
  },
  // build: {
  //   rollupOptions: {
  //     external: ['wrangler', 'sqlite']
  //   }
  // }
})

export default config
