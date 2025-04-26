import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import {TanStackRouterVite} from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import browserslist from 'browserslist'; // You need to import this package
import {browserslistToTargets} from 'lightningcss'; // And this utility
import {defineConfig} from 'rolldown-vite';
import arraybuffer from 'vite-plugin-arraybuffer';
import viteCompression from 'vite-plugin-compression';
import wasm from 'vite-plugin-wasm';

export default defineConfig(({mode}) => {
  const isProduction = mode === 'production';

  return {
    css: {
      transformer: 'lightningcss',
      lightningcss: {
        targets: browserslistToTargets(
          browserslist(undefined, {
            env: mode,
          }),
        ),
      },
    },
    plugins: [
      wasm(),
      arraybuffer(),
      TanStackRouterVite({target: 'react', autoCodeSplitting: true}),
      tailwindcss(),
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler', {target: '19'}]],
        },
      }),
      viteCompression({
        verbose: true,
        disable: !isProduction,
        filter: /\.(js|mjs|json|css|html|svg|wasm)$/i,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz',
        deleteOriginFile: false,
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
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
      allowedHosts: ['www.pkaindextest.com'],
      hmr: {
        protocol: 'ws',
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      target: 'esnext',
      cssMinify: 'lightningcss',
    },
  };
});
