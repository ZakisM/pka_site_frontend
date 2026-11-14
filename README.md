[![Check](https://github.com/ZakisM/pka_site_frontend/actions/workflows/check.yml/badge.svg)](https://github.com/ZakisM/pka_site_frontend/actions/workflows/check.yml)

# PKA Index Frontend

The frontend for https://www.pkaindex.com.

## Develop

The app calls the API on its own origin (`/api/v1`), so it runs behind the same
reverse proxy as [the backend](https://github.com/ZakisM/pka_site_backend/):

1. Set up and start the backend.
2. Install [Vite+](https://viteplus.dev/guide/): `curl -fsSL https://vite.plus | bash`. Its `vp` command runs
   everything below, on the Node in `.node-version` and the pnpm in `package.json`, fetching both itself.
3. `vp install`
4. `vp dev` serves the app on port 5678.
5. Visit https://www.pkaindextest.com.

| Command           | Does                                                      |
| ----------------- | --------------------------------------------------------- |
| `vp dev`          | Vite dev server on port 5678                              |
| `vp run serve`    | Production build, previewed on port 5678                  |
| `vp check`        | Format check (oxfmt), lint (oxlint) and typecheck at once |
| `vp check --fix`  | The same, fixing what it can                              |
| `vp test`         | Unit tests (`*.test.ts`, Vitest)                          |
| `vp run test:e2e` | Browser tests (Playwright)                                |
| `vp build`        | Production bundle in `dist/`                              |

Without `vp` installed, `pnpm install` and then `pnpm vp <command>` do the same.

Measure performance against `vp run serve`, never `vp dev`: React's development
build makes large lists look far slower than they ship.

## Docker

The image is an optimised build served by nginx, not suited to development.

1. `docker build -t zakism/pka-site-frontend:latest .`
2. `docker run -p 5678:5678 zakism/pka-site-frontend:latest`
3. Visit https://www.pkaindextest.com.

Pushes to `master` build and publish the image once Check passes; it is also rebuilt every Monday for base-image fixes.
