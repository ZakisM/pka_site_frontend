import "@fontsource-variable/geist";
import "./styles.css";
import { Navigate, RouterProvider, createRouter } from "@tanstack/react-router";
import { readJson, writeJson } from "@/lib/storage";
import { ErrorPage } from "@/ui/ErrorPage";
import { QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import { queryClient } from "@/lib/queries";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
  routeTree,
  context: { queryClient },
  // Deliberately no pendingComponent: it would replace the route's tree on
  // every navigation and take the player's iframe with it. The root renders
  // the scan bar and the first-load skeleton instead.
  defaultPreloadStaleTime: 0,
  // Back and Forward return every page — home, results, an episode — to where
  // it was scrolled.
  scrollRestoration: true,
  defaultNotFoundComponent: () => <Navigate to="/" replace />,
  defaultErrorComponent: ({ error }) => <ErrorPage error={error} />,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// A tab opened before a deploy still runs the old build, whose route chunks
// the deploy removed: when one fails to load, reload onto the new build. Once:
// a chunk that fails again straight after is missing or blocked in this build
// too, and reloading again would never stop. That error reaches the error page.
const RELOADED_KEY = "reloaded-for-build";
const RELOAD_WINDOW_MS = 10_000;

globalThis.addEventListener("vite:preloadError", (event) => {
  const reloadedAt = readJson(() => sessionStorage, RELOADED_KEY);

  if (typeof reloadedAt === "number" && Date.now() - reloadedAt < RELOAD_WINDOW_MS) {
    return;
  }

  writeJson(() => sessionStorage, RELOADED_KEY, Date.now());
  event.preventDefault();
  globalThis.location.reload();
});

const rootElement = document.querySelector("#root");

if (!rootElement) {
  throw new Error("Failed to find #root to mount into.");
}

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
