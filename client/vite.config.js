import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const turnstileSiteKey = process.env.VITE_TURNSTILE_SITE_KEY || process.env.TURNSTILE_SITE_KEY || '';

export default defineConfig({
  plugins: [react()],
  define: {
    __TURNSTILE_SITE_KEY__: JSON.stringify(turnstileSiteKey),
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
