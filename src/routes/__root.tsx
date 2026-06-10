import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { NavBar } from "@/components/NavBar";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const RootComponent = () => (
  <div className="flex h-dvh flex-col lg:flex-row">
    <NavBar />
    <div className="min-h-0 min-w-0 flex-1 max-xl:overflow-y-auto xl:p-6">
      <Outlet />
    </div>
    <ReactQueryDevtools buttonPosition="bottom-left" />
    <TanStackRouterDevtools position="bottom-right" />
  </div>
);

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});
