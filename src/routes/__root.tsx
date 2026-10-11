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
import { fadeIn } from "@/lib/motion";
import { playerObscuredAtom } from "@/player/playerState";
import { resultsScroll } from "@/search/searchState";
import { useSetAtom } from "jotai";

/**
 * While a query is showing, the page it was typed over stays mounted, still
 * And untouched, under the results: unmounting the watch page would destroy
 * The player's iframe, and the page keeps its scroll position for when the
 * Results close. The page's own scrolling is locked meanwhile.
 */
const useSearchOverlay = (searching: boolean) => {
  const setPlayerObscured = useSetAtom(playerObscuredAtom);

  // The video should not keep playing under the results.
  useEffect(() => {
    setPlayerObscured(searching);
    document.documentElement.classList.toggle("search-open", searching);
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
  const routeId = useRouterState({ select: (state) => state.matches.at(-1)?.routeId });

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

  const resultsRef = useRef<HTMLDivElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const shownRouteRef = useRef(routeId);

  // Home and watch fade into each other. Not one episode into the next: that
  // Is the same page, and the player stays put while its video swaps.
  useLayoutEffect(() => {
    if (shownRouteRef.current !== routeId) {
      shownRouteRef.current = routeId;
      fadeIn(pageRef.current);
    }
  }, [routeId]);

  // Reopening a query's results puts them back where they were left. (Back
  // And Forward are handled by the router's restoration; this covers opening
  // Them again from the search box, which is a new history entry.)
  useLayoutEffect(() => {
    const layer = resultsRef.current;
    const saved = query ? resultsScroll.get(query) : undefined;

    // A query not seen before starts at the top, not at the last one's offset.
    if (layer) {
      layer.scrollTop = saved ?? 0;
    }
  }, [query]);

  return (
    <>
      <AppHeader />
      <div className="sticky top-(--header-h) z-10 h-0">{pending && <ScanBar />}</div>
      <div ref={pageRef} inert={Boolean(query)}>
        {pending && !loadedOnce && onWatch ? <WatchSkeleton /> : <Outlet />}
      </div>
      {query && (
        // A layer over the page with its own scroll, rather than hiding the
        // Page: hiding it shortened the document and the browser clipped the
        // Page's scroll position. Its own position is restored on Back by id.
        <div
          ref={resultsRef}
          data-scroll-restoration-id="search-results"
          onScroll={(event) => resultsScroll.set(query, event.currentTarget.scrollTop)}
          className="fixed inset-x-0 top-(--header-h) bottom-0 z-10 animate-fade-in overflow-y-auto overscroll-contain bg-bg"
        >
          <SearchPage query={query} scrollRoot={resultsRef} />
        </div>
      )}
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
