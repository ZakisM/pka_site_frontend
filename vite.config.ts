import { constants, gzipSync } from "node:zlib";
import { defineConfig, lazyPlugins } from "vite-plus";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import type { Plugin } from "vite-plus";
import babel from "@rolldown/plugin-babel";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

const COMPRESSIBLE = /\.(?:js|css|html|svg|json)$/u;
// Below this, nginx's on-the-fly compression is as good and a file saves nothing.
const MIN_COMPRESS_BYTES = 1024;

/**
 * Writes `.gz` beside every built text file, at the highest setting: done once
 * here rather than per request, and nginx serves them as they are
 * (gzip_static).
 */
const precompress = (): Plugin => {
  let outDir = "dist";

  return {
    name: "pka:precompress",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const files = readdirSync(outDir, { recursive: true, encoding: "utf8" })
        .filter((entry) => COMPRESSIBLE.test(entry))
        .map((entry) => ({ file: path.join(outDir, entry), data: readFileSync(path.join(outDir, entry)) }))
        .filter(({ data }) => data.length >= MIN_COMPRESS_BYTES);

      for (const { file, data } of files) {
        writeFileSync(`${file}.gz`, gzipSync(data, { level: constants.Z_BEST_COMPRESSION }));
      }
    },
  };
};

/**
 * The headers nginx sends with every response (security-headers.conf), for
 * `vp preview` to send too, so the browser tests run under the same policy.
 * Not the dev server: its hot reload runs inline scripts the policy forbids.
 */
const securityHeaders = () => {
  const lines = readFileSync(path.resolve(import.meta.dirname, "security-headers.conf"), "utf8").split("\n");
  const headers: Record<string, string> = {};

  const directives = [...lines.entries()].filter(([, line]) => line.trim().startsWith("add_header"));

  for (const [index, line] of directives) {
    // Only this form is read. Anything else nginx accepts (no quotes, no
    // `always`) would be left out of the preview, so it's an error instead.
    const groups = /^add_header\s+(?<name>\S+)\s+"(?<value>[^"]*)"\s+always;$/u.exec(line.trim())?.groups;

    if (groups?.name === undefined || groups.value === undefined) {
      throw new Error(`security-headers.conf:${index + 1}: write it as add_header Name "value" always;`);
    }

    headers[groups.name] = groups.value;
  }

  if (!("Content-Security-Policy" in headers)) {
    throw new Error("security-headers.conf: no Content-Security-Policy found");
  }

  return headers;
};

const HOST = { port: 5678, strictPort: true, host: "0.0.0.0", allowedHosts: ["www.pkaindextest.com"] };

export default defineConfig({
  // Lazy, so `vp check` and the editor don't load the build's plugins.
  plugins: lazyPlugins(() => [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    tailwindcss(),
    react(),
    // Plugin-react 6 dropped its babel option, which silently switched the
    // React Compiler off; it now runs through its own Babel plugin.
    babel({ presets: [reactCompilerPreset()] }),
    precompress(),
  ]),
  resolve: {
    // The `@/` alias, read from tsconfig.app.json's `paths`.
    tsconfigPaths: true,
  },
  // Plain ws:// on purpose, though the dev site is https: the browser blocks it
  // on the page's own host, and Vite's client then falls back to
  // ws://localhost:5678, which it allows. wss would rely on the reverse proxy
  // passing WebSocket upgrades through instead.
  server: { ...HOST, hmr: { protocol: "ws" } },
  preview: { ...HOST, headers: securityHeaders() },
  test: {
    include: ["src/**/*.test.ts"],
  },
  fmt: {
    printWidth: 120,
    sortPackageJson: false,
    ignorePatterns: ["src/routeTree.gen.ts"],
  },
  lint: {
    plugins: ["eslint", "typescript", "unicorn", "oxc", "react", "jsx-a11y", "import", "promise"],
    options: {
      typeAware: true,
      reportUnusedDisableDirectives: "error",
      typeCheck: true,
    },
    env: {
      browser: true,
    },
    ignorePatterns: ["src/routeTree.gen.ts"],
    categories: {
      correctness: "error",
      suspicious: "error",
      pedantic: "error",
      perf: "error",
      style: "error",
      restriction: "error",
      nursery: "error",
    },
    rules: {
      // Only a comment's first line starts with a capital; the lines it
      // wraps onto carry on the sentence.
      "eslint/capitalized-comments": ["error", "always", { ignoreConsecutiveComments: true }],
      "eslint/id-length": "off",
      "eslint/max-depth": "off",
      "eslint/max-lines-per-function": "off",
      "eslint/max-nested-callbacks": "off",
      "eslint/max-statements": "off",
      "eslint/new-cap": "off",
      "eslint/no-console": "off",
      "eslint/no-duplicate-imports": [
        "error",
        {
          allowSeparateTypeImports: true,
        },
      ],
      "eslint/no-magic-numbers": "off",
      "eslint/no-ternary": "off",
      "eslint/no-undefined": "off",
      "eslint/no-void": [
        "error",
        {
          allowAsStatement: true,
        },
      ],
      "eslint/one-var": "off",
      "eslint/require-await": "off",
      "eslint/sort-keys": "off",
      "eslint/yoda": "off",
      "import/exports-last": "off",
      "import/group-exports": "off",
      "import/max-dependencies": "off",
      "import/no-named-export": "off",
      "import/no-unassigned-import": "off",
      "import/prefer-default-export": "off",
      "oxc/no-async-await": "off",
      "oxc/no-optional-chaining": "off",
      "oxc/no-rest-spread-properties": "off",
      "promise/avoid-new": "off",
      "react/forbid-component-props": "off",
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],
      "react/jsx-filename-extension": "off",
      "react/jsx-handler-names": "off",
      "react/jsx-max-depth": "off",
      "react/jsx-no-literals": "off",
      "react/no-multi-comp": "off",
      "react/react-in-jsx-scope": "off",
      "typescript/consistent-indexed-object-style": "off",
      "typescript/consistent-return": "off",
      "typescript/consistent-type-definitions": "off",
      "typescript/explicit-function-return-type": "off",
      "typescript/explicit-module-boundary-types": "off",
      "typescript/no-confusing-void-expression": [
        "error",
        {
          ignoreArrowShorthand: true,
        },
      ],
      "typescript/no-explicit-any": "off",
      "typescript/only-throw-error": [
        "error",
        {
          allow: [
            {
              from: "package",
              name: "Redirect",
              package: "@tanstack/router-core",
            },
          ],
        },
      ],
      "typescript/prefer-readonly-parameter-types": "off",
      "typescript/require-await": "error",
      "unicorn/filename-case": "off",
      "unicorn/no-null": "off",
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    overrides: [
      {
        files: ["vite.config.ts"],
        rules: {
          "import/no-default-export": "off",
          "import/no-nodejs-modules": "off",
        },
      },
      {
        files: ["src/routes/**"],
        rules: {
          "react/only-export-components": "off",
        },
      },
      {
        files: ["**/*.d.ts"],
        rules: {
          "import/unambiguous": "off",
        },
      },
      {
        files: ["playwright.config.ts"],
        env: {
          node: true,
        },
        rules: {
          "import/no-default-export": "off",
        },
      },
    ],
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
  },
});
