import build from '@hono/vite-build/cloudflare-workers'
import tailwindcss from '@tailwindcss/vite'
import honox from 'honox/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    honox({
      client: { input: ['./app/style.css'] }
    }),
    tailwindcss(),
    build()
  ]
})
