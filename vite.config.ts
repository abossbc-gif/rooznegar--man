import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // If API_KEY is set in the environment, use it. Otherwise, use an empty string.
    // This makes checks in the code cleaner (e.g., !process.env.API_KEY).
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
})
