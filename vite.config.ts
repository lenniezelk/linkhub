// vite.config.ts
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    server: {
        port: 3000,
    },
    plugins: [
        tsConfigPaths(),
        tanstackStart({
            customViteReactPlugin: true,
            target: "cloudflare-module", // Key configuration for Cloudflare compatibility
        }),
        viteReact(),
        tailwindcss(),
    ],
    assetsInclude: ['**/*.riv']
})