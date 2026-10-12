# Repository Guidelines

## Project Structure & Module Organization

The React + Vite app lives under `src`, organised by feature rather than by file type:

| Folder    | Holds                                                                                         |
| --------- | --------------------------------------------------------------------------------------------- |
| `routes/` | TanStack Router route files; `routeTree.gen.ts` is generated — never edit it                  |
| `player/` | The YouTube iframe, owned by `controller`; `watchHistory` keeps positions and recent episodes |
| `home/`   | The home page — continue watching and the archive grid, filterable by year                    |
| `watch/`  | The watch screen — player, episode bar, moments rail                                          |
| `search/` | The header search field and the results page drawn over any page via `?q=`                    |
| `ui/`     | Shared presentation: header, wordmark, thumbnail, highlight, loaders, error page              |
| `lib/`    | Non-visual shared code: API client, query options, formatters, small hooks                    |

Search is a root search param, not a route: results render over whichever page is open while that page stays mounted but hidden, so the player keeps its iframe and home keeps its scroll. Never turn search into a route of its own.

Only `player/controller` touches the YouTube player: ask it (`request`, `seek`), never hold the iframe or trust a command to have landed. A navigation that asks the watch page for something — start at a moment, filter the moments — carries it in that history entry's state via `lib/intents`, scoped to its episode and acted on once. Never route such a request through global state: it outlives a cancelled navigation and fires on the next visit.

Feature folders own their own state and hooks; anything imported by two features belongs in `lib/` or `ui/`. Static assets live in `public/`, production bundles in `dist/`.

## Build, Test, and Development Commands

Install with `bun install`. `bun run dev` starts Vite on port 5678, `bun run serve` gives a production-like preview. Check types with `bun run typecheck` (tsc, TypeScript 7), lint with `bun run lint` (oxlint, type-aware via tsgolint) format with `bun run format` (oxfmt, 120 columns) and test with `bun run test` (Bun's runner; tests sit beside their source as `*.test.ts`, typechecked by `tsconfig.test.json`).

Browser tests run with `bun run test:e2e`: Playwright drives the production build in Chromium at desktop and phone sizes (`e2e/*.e2e.ts`, typechecked by `tsconfig.e2e.json`; run `bunx playwright install chromium` once first). The API and YouTube are faked inside each test (`e2e/archive.ts`, `e2e/fixtures.ts`), so nothing else needs to be running and no request leaves the machine. A bug in how the app behaves, rather than what it computes, gets a browser test, and that test must fail with the fix removed before it counts.

**Measure performance against `bun run serve`, never `dev`.** React's development build instruments prop diffs, which makes large lists (search holds ~35k rows) look far slower than they ship.

## Coding Style & Naming Conventions

TypeScript with strict typing and 2-space indentation. Components and hooks use PascalCase and camelCase filenames respectively (`MomentsRail.tsx`, `useWatchState.ts`); prefer named exports. Import order is enforced: side-effect, namespace, multi-member, then single-member, alphabetically within each group. Tailwind utilities drive styling — keep tokens in `styles.css` and use the `@` alias for cross-feature imports.

### Design system

Tokens live in `@theme` in `src/styles.css`. Two rules bite often:

- **Leading:** `body` sets `line-height: normal`. Use arbitrary sizes (`text-[14px]`) which inherit it, not `text-sm`/`text-xs`, which pair their own leading.
- **Box sizing:** Tailwind boxes are border-box, so a "56px cell plus a hairline" is `h-[57px]`.

Breakpoints are the custom `desktop:`/`mobile:` variants, not Tailwind's widths: the two-column UI needs width _and_ height, so a tablet or unfolded foldable gets it while a landscape phone does not.

### Lint

oxlint runs every rule category at error, with the React, jsx-a11y, import and promise plugins and type-aware TypeScript rules; `.oxlintrc.json` turns off the few that contradict the codebase's conventions. Fix what it reports. When a rule is wrong for one line — say, an effect dependency that only exists to re-run it — suppress that rule on that line and say why in the comment above; unused suppressions fail the lint.

## Commit & Pull Request Guidelines

Commits use short, imperative subjects (e.g. "Fix spinner") scoped to a single concern. CI runs typecheck, lint, a format check, tests, build and the browser tests on every PR; run them locally before pushing, attach screenshots for UI diffs, and cross-link relevant issues. Never link an AI coding session (a `claude.ai/code/session_…` URL or a `Claude-Session:` trailer) in commit messages, PR descriptions or comments: the repository is public.
