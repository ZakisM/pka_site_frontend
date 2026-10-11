import {
  Outlet,
  createRootRouteWithContext,
  useRouterState,
  useSearch,
} from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AppHeader } from "@/ui/AppHeader";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ScanBar } from "@/ui/Loaders";
import { SearchPage } from "@/search/SearchPage";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { WatchSkeleton } from "@/watch/WatchSkeleton";
import { playerObscuredAtom } from "@/player/playerState";
import { useSetAtom } from "jotai";

/**
 * While a query is showing, the page it was typed over stays mounted but
 * Hidden: unmounting the watch page would destroy the player's iframe, and
 * Home would lose its place. Closing the results restores the scroll position.
 */
const useSearchOverlay = (searching: boolean) => {
  const setPlayerObscured = useSetAtom(playerObscuredAtom);
  const savedScrollRef = useRef(0);
  const wasSearchingRef = useRef(searching);

  useLayoutEffect(() => {
    if (searching === wasSearchingRef.current) {
      return;
    }

    wasSearchingRef.current = searching;

    if (searching) {
      savedScrollRef.current = globalThis.scrollY;
      globalThis.scrollTo(0, 0);
    } else {
      globalThis.scrollTo(0, savedScrollRef.current);
    }
  }, [searching]);

  // The video should not keep playing under the results.
  useEffect(() => {
    setPlayerObscured(searching);
  }, [searching, setPlayerObscured]);
};

const RootComponent = () => {
  const query = useSearch({ strict: false, select: (search) => search.q });
  // Status, not isLoading or isTransitioning — those stay false for the whole
  // Pending window, so the bar would never appear.
  const pending = useRouterState({ select: (state) => state.status === "pending" });
  const onWatch = useRouterState({
    select: (state) => state.location.pathname.startsWith("/watch"),
  });

  // The watch skeleton is for the very first paint only. A route-level
  // PendingComponent would replace the screen on every navigation and take
  // The player's iframe with it; afterwards the outgoing screen simply stays
  // Put under the scan bar until the next one is ready.
  const [loadedOnce, setLoadedOnce] = useState(false);

  useEffect(() => {
    if (!pending) {
      setLoadedOnce(true);
    }
  }, [pending]);

  useSearchOverlay(Boolean(query));

  return (
    <>
      <AppHeader />
      <div className="sticky top-(--header-h) z-10 h-0">{pending && <ScanBar />}</div>
      {query && <SearchPage query={query} />}
      <div hidden={Boolean(query)}>
        {pending && !loadedOnce && onWatch ? <WatchSkeleton /> : <Outlet />}
      </div>
      <ReactQueryDevtools buttonPosition="bottom-left" />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
};

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  // The search query belongs to every page: results are drawn over whichever
  // One it was typed on.
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: typeof search.q === "string" && search.q.trim() ? search.q.trim() : undefined,
  }),
});
