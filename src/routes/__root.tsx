import {
  Outlet,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/ui/AppHeader";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ScanBar } from "@/ui/Loaders";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { WatchSkeleton } from "@/watch/WatchSkeleton";

const RootComponent = () => {
  // Status, not isLoading or isTransitioning — those stay false for the whole
  // Pending window, so the bar would never appear.
  const pending = useRouterState({
    select: (state) => state.status === "pending",
  });

  // The skeleton is for the very first paint only. A route-level pending
  // Component would replace the screen on *every* navigation, unmounting the
  // Player and destroying its iframe mid-switch — which left the previous
  // Episode loaded. Afterwards the outgoing screen simply stays put under the
  // Scan bar until the next one is ready.
  const [loadedOnce, setLoadedOnce] = useState(false);

  useEffect(() => {
    if (!pending) {
      setLoadedOnce(true);
    }
  }, [pending]);

  return (
    <div className="flex h-dvh flex-col bg-bg desktop:overflow-auto">
      <AppHeader />
      {/* The placeholder keeps the 2px reserved, so showing the bar never
          nudges the screen down. */}
      {pending ? <ScanBar /> : <div aria-hidden className="h-0.5" />}
      <div className="min-h-0 min-w-0 flex-1 mobile:overflow-y-auto">
        {pending && !loadedOnce ? <WatchSkeleton /> : <Outlet />}
      </div>
      <ReactQueryDevtools buttonPosition="bottom-left" />
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  );
};

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});
