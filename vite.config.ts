import { defineConfig, type Plugin } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Plugin to ignore hot updates originating from Cloudflare D1 local state files
function ignoreWranglerState(): Plugin {
  const marker = `${path.sep}.wrangler${path.sep}state${path.sep}`
  return {
    name: 'ignore-wrangler-state-hmr',
    handleHotUpdate(ctx) {
      if (ctx.file.includes(marker)) {
        // Return empty array to tell Vite: do not trigger a reload for this change
        return []
      }
    },
  }
}

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
    ignoreWranglerState(),
  ],
  assetsInclude: ['**/*.riv'],
  ssr: {
    external: ['sqlite', 'wrangler', '@tanstack/react-devtools', '@tanstack/devtools'],
  },
  optimizeDeps: {
    exclude: ['wrangler', 'sqlite']
  },
  server: {
    watch: {
      // Ignore Cloudflare D1 preview database churn (WAL/SHM writes) to prevent constant full reloads
      ignored: [
        '**/.wrangler/**',
        '**/.wrangler/state/**',
        '**/.wrangler/state/v3/**',
        '**/.wrangler/state/v3/d1/**'
      ]
    }
  }
  // build: {
  //   rollupOptions: {
  //     external: ['wrangler', 'sqlite']
  //   }
  // }
})

export default config
