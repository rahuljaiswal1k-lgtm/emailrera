import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//
// The app is served from a GitHub Pages project site
// (https://<user>.github.io/emailrera/), so every asset URL needs that prefix.
// It is applied to `dev` and `preview` too, so the local URL matches production
// exactly — Vite prints the full URL (…:5173/emailrera/) on startup.
// Set BASE_PATH to override it — use "/" if you later move this to a custom
// domain or a user/organization Pages site.
export default defineConfig({
  base: process.env.BASE_PATH || '/emailrera/',
  plugins: [react()],
  build: {
    // The app is a single bundle by design (no routing), and jszip + dnd-kit
    // push it just past Vite's default 500 kB warning threshold.
    chunkSizeWarningLimit: 700,
  },
})
