import {defineConfig} from 'rolldown-vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(({mode}) => {
  const isProduction = mode === 'production';

  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler', {target: '19'}]],
        },
      }),
      viteCompression({
        verbose: true,
        disable: !isProduction,
        filter: /\.(js|mjs|json|css|html|svg)$/i,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz',
        deleteOriginFile: false,
      }),
      viteCompression({
        verbose: true,
        disable: !isProduction,
        filter: /\.(js|mjs|json|css|html|svg)$/i,
        threshold: 10240,
        algorithm: 'brotliCompress',
        ext: '.br',
        deleteOriginFile: false,
      }),
    ],
    resolve: {
      alias: {
        LibWasm: path.resolve(__dirname, 'src/lib_wasm'),
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    server: {
      port: 5678,
      strictPort: true,
      host: '0.0.0.0',
      hmr: {
        protocol: 'ws',
        host: 'localhost',
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      target: 'esnext',
    },
  };
});
