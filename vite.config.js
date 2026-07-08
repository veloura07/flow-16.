import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚠️  Change 'my-roadmap' below to match your GitHub repository name exactly
// Example: if your repo is github.com/sreeshanth/engineering-roadmap
//          set base to '/engineering-roadmap/'
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all'
  }
})
