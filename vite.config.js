import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  base: '/if-minecraft/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: false,  // ブラウザ自動起動を無効化
  },
});
