import { brotliCompressSync, constants, gzipSync } from "node:zlib";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import type { Plugin } from "vite";
import babel from "@rolldown/plugin-babel";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import { defineConfig } from "vite";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

const COMPRESSIBLE = /\.(?:js|css|html|svg|json)$/u;
// Below this, nginx's on-the-fly compression is as good and a file saves nothing.
const MIN_COMPRESS_BYTES = 1024;

/**
 * Writes `.br` and `.gz` beside every built text file, at the highest
 * settings: done once here rather than per request, and nginx serves them as
 * they are (brotli_static, gzip_static). Brotli 11 is about an eighth smaller
 * than nginx's on-the-fly gzip for the main bundle.
 */
const precompress = (outDir: string): Plugin => ({
  name: "pka:precompress",
  apply: "build",
  closeBundle() {
    const files = readdirSync(outDir, { recursive: true, encoding: "utf8" })
      .filter((entry) => COMPRESSIBLE.test(entry))
      .map((entry) => ({ file: path.join(outDir, entry), data: readFileSync(path.join(outDir, entry)) }))
      .filter(({ data }) => data.length >= MIN_COMPRESS_BYTES);

    for (const { file, data } of files) {
      writeFileSync(
        `${file}.br`,
        brotliCompressSync(data, {
          params: {
            [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY,
            [constants.BROTLI_PARAM_SIZE_HINT]: data.length,
          },
        }),
      );
      writeFileSync(`${file}.gz`, gzipSync(data, { level: constants.Z_BEST_COMPRESSION }));
    }
  },
});

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    css: {
      transformer: "lightningcss",
      lightningcss: {
        targets: browserslistToTargets(
          browserslist(undefined, {
            env: mode,
          }),
        ),
      },
    },
    plugins: [
      tanstackRouter({ target: "react", autoCodeSplitting: true }),
      tailwindcss(),
      react(),
      // Plugin-react 6 dropped its babel option, which silently switched the
      // React Compiler off; it now runs through its own Babel plugin.
      babel({ presets: [reactCompilerPreset()] }),
      ...(isProduction ? [precompress(path.resolve(import.meta.dirname, "dist"))] : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
    server: {
      port: 5678,
      strictPort: true,
      host: "0.0.0.0",
      allowedHosts: ["www.pkaindextest.com"],
      hmr: {
        protocol: "ws",
      },
    },
    preview: {
      port: 5678,
      strictPort: true,
      host: "0.0.0.0",
      allowedHosts: ["www.pkaindextest.com"],
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      target: "esnext",
      cssMinify: "lightningcss",
    },
  };
});
