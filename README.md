[![Check](https://github.com/ZakisM/pka_site_frontend/actions/workflows/check.yml/badge.svg)](https://github.com/ZakisM/pka_site_frontend/actions/workflows/check.yml)

# PKA Index Frontend

The frontend for https://www.pkaindex.com.

## Develop

The app calls the API on its own origin (`/api/v1`), so it runs behind the same
reverse proxy as [the backend](https://github.com/ZakisM/pka_site_backend/):

1. Set up and start the backend.
2. `bun install`
3. `bun run dev` serves the app on port 5678.
4. Visit https://www.pkaindextest.com.

| Command             | Does                                     |
| ------------------- | ---------------------------------------- |
| `bun run dev`       | Vite dev server on port 5678             |
| `bun run serve`     | Production build, previewed on port 5678 |
| `bun run typecheck` | TypeScript, app and tooling configs      |
| `bun run lint`      | oxlint                                   |
| `bun run format`    | oxfmt; CI runs `bun run format:check`    |
| `bun run build`     | Production bundle in `dist/`             |

Measure performance against `bun run serve`, never `dev`: React's development
build makes large lists look far slower than they ship.

## Docker

The image is an optimised build served by nginx, not suited to development.

1. `docker build -t zakism/pka-site-frontend:latest .`
2. `docker run -p 5678:5678 zakism/pka-site-frontend:latest`
3. Visit https://www.pkaindextest.com.

Pushes to `master` build and publish the image.
