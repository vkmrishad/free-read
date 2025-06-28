import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: '/free-read/',
  base: '/', // <- IMPORTANT for custom domains
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
