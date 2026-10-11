import "@fontsource-variable/geist";
import "@fontsource-variable/raleway";
import "./styles.css";
import { Navigate, RouterProvider, createRouter } from "@tanstack/react-router";
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
  // Every navigation and take the player's iframe with it. The root renders
  // The scan bar and the first-load skeleton instead.
  defaultPreloadStaleTime: 0,
  // Back and Forward return every page — home, results, an episode — to where
  // It was scrolled.
  scrollRestoration: true,
  defaultNotFoundComponent: () => <Navigate to="/" replace />,
  defaultErrorComponent: ({ error }) => <ErrorPage error={error} />,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

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
