# Repository Guidelines

## Project Structure & Module Organization
The React + Vite app lives under `src`, with routing defined in `routes/*` and generated helpers in `routeTree.gen.ts`. UI building blocks live in `components/` and shareable state/hooks sit in `atoms/`, `utils/`, and `queryClient.ts`. WebAssembly bindings compiled from `lib_wasm` are committed to `src/lib_wasm_out/`; static assets remain in `public/`, while production bundles land in `dist/`.

## Build, Test, and Development Commands
Install dependencies with `bun install` (preferred) or `yarn install` if Bun is unavailable. Use `bun run dev` to start Vite on port 5678, and `bun run serve` for a production-like preview after `bun run build`. Docker users can reuse `docker build -t zakism/pka-site-frontend:latest .` followed by `docker run -p 5678:5678 zakism/pka-site-frontend:latest` for smoke tests.

## Coding Style & Naming Conventions
Write TypeScript with strict typing and 2-space indentation to match existing modules. Components and hooks should use PascalCase files (`Spinner.tsx`, `useEpisode.ts`) and default to named exports for tree-shaking. Tailwind utility classes drive styling; keep shared tokens in `styles.css` and prefer the `@` alias for deep imports (`@/components/LinkButton`).

## Testing Expectations
Testing relies on React Testing Library with `@testing-library/jest-dom` bootstrapped through `src/setupTests.ts`. Place colocated specs as `.test.tsx` files alongside the module under test and mirror the component name. Exercise new routes or API adapters with at least one happy-path test and document edge cases in the PR if coverage is not feasible.

## WASM Workflow
The Rust crate in `lib_wasm/` must be rebuilt whenever bindings change. Run `just wasm-build` to compile the binary, `just wasm-bindgen` to emit TypeScript shims, and `just update-wasm-bindgen` to sync them into `src/lib_wasm_out/`. Keep the generated files committed so CI-only installs remain deterministic.

## Commit & Pull Request Guidelines
Commits use short, imperative subjects (e.g., “Fix spinner”) and should be scoped to a single concern. Before opening a PR, ensure `bun run build` passes, attach screenshots for UI diffs, and cross-link any relevant GitHub issues. Describe the impact, testing evidence, and any follow-up tasks so reviewers can validate quickly.
