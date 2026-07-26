# Repository Guidelines

## Project Structure & Module Organization
The React + Vite app lives under `src`, organised by feature rather than by file type:

| Folder | Holds |
| --- | --- |
| `routes/` | TanStack Router route files; `routeTree.gen.ts` is generated — never edit it |
| `player/` | The YouTube iframe: `usePlayer` owns its whole lifecycle, `playerState` its atoms |
| `watch/` | The watch screen — player, playing-now band, episode meta, moments rail |
| `search/` | The ⌘K takeover — screen, results, preview panel, and its hooks/atoms |
| `ui/` | Shared presentation: header, wordmark, loaders, tooltip, scrollbars, error page |
| `lib/` | Non-visual shared code: API client, query options, formatters, small hooks |

Feature folders own their own state and hooks; anything imported by two features belongs in `lib/` or `ui/`. WebAssembly bindings compiled from `lib_wasm` are committed to `src/lib_wasm_out/`; static assets live in `public/`, production bundles in `dist/`.

## Build, Test, and Development Commands
Install with `bun install`. `bun run dev` starts Vite on port 5678, `bun run serve` gives a production-like preview. Check types with `bun run typecheck` (tsc, TypeScript 7) and lint with `bun run lint` (oxlint).

**Measure performance against `bun run serve`, never `dev`.** React's development build instruments prop diffs, which makes large lists (search holds ~35k rows) look far slower than they ship.

## Coding Style & Naming Conventions
TypeScript with strict typing and 2-space indentation. Components and hooks use PascalCase and camelCase filenames respectively (`MomentsRail.tsx`, `usePlayer.ts`); prefer named exports. Import order is enforced: side-effect, namespace, multi-member, then single-member, alphabetically within each group. Tailwind utilities drive styling — keep tokens in `styles.css` and use the `@` alias for cross-feature imports.

### Design system
Tokens live in `@theme` in `src/styles.css`. Two rules bite often:
- **Leading:** `body` sets `line-height: normal`. Use arbitrary sizes (`text-[14px]`) which inherit it, not `text-sm`/`text-xs`, which pair their own leading.
- **Box sizing:** Tailwind boxes are border-box, so a "56px cell plus a hairline" is `h-[57px]`.

Breakpoints are the custom `desktop:`/`mobile:` variants, not Tailwind's widths: the two-column UI needs width *and* height, so a tablet or unfolded foldable gets it while a landscape phone does not.

## WASM Workflow
The Rust crate in `lib_wasm/` must be rebuilt whenever bindings change. Run `just wasm-build`, `just wasm-bindgen`, then `just update-wasm-bindgen` to sync `src/lib_wasm_out/`. Keep the generated files committed.

## Commit & Pull Request Guidelines
Commits use short, imperative subjects (e.g. "Fix spinner") scoped to a single concern. Before opening a PR ensure `bun run build` passes, attach screenshots for UI diffs, and cross-link relevant issues.
