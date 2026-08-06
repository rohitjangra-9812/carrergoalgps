import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR === 'true' ? false : {
        // Ensure WebSocket connection works reliably in varied environments
        clientPort: 3000
      },
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        usePolling: true
      },
    },
  };
});
