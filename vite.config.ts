import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import babel from "@rolldown/plugin-babel";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import { defineConfig } from "vite";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import viteCompression from "vite-plugin-compression";

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
      TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
      tailwindcss(),
      react(),
      // Plugin-react 6 dropped its babel option, which silently switched the
      // React Compiler off; it now runs through its own Babel plugin.
      babel({ presets: [reactCompilerPreset()] }),
      viteCompression({
        verbose: true,
        disable: !isProduction,
        filter: /\.(?:js|mjs|json|css|html|svg)$/iu,
        threshold: 10_240,
        algorithm: "gzip",
        ext: ".gz",
        deleteOriginFile: false,
      }),
      viteCompression({
        verbose: true,
        disable: !isProduction,
        filter: /\.(?:js|mjs|json|css|html|svg)$/iu,
        threshold: 10_240,
        algorithm: "brotliCompress",
        ext: ".br",
        deleteOriginFile: false,
      }),
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
