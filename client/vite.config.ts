import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@future/shared': path.resolve(import.meta.dirname, '../shared/src/index.ts'),
    },
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react', '@gsap/react', 'gsap'],
  },
  server: {
    host: true,
    port: 5176,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        timeout: 15000,
        proxyTimeout: 15000,
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            if (res && 'writeHead' in res && !res.headersSent) {
              res.writeHead(504, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(
                JSON.stringify({
                  error: {
                    code: 'GATEWAY_TIMEOUT',
                    message: 'السيرفر قيد إعادة التشغيل أو لم يستجب بالوقت المحدد. يرجى المحاولة بعد لحظات.',
                  },
                }),
              );
            }
          });
        },
      },
    },
  },
  preview: { host: '127.0.0.1', port: 4173 },
});
