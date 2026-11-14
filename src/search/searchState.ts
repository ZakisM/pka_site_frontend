import type { SearchSort } from "@/lib/api";
import { createStore } from "@/lib/store";
import { useCallback } from "react";
import { useRouter } from "@tanstack/react-router";

declare module "@tanstack/react-router" {
  interface HistoryState {
    // Set on history entries the search field pushed over another page.
    searchOverlay?: boolean;
  }
}

// Kept for the session, so coming back to results keeps the chosen order.
export const searchSort = createStore<SearchSort>("newest");

// Where each query's results were last scrolled to, for this session: opening
// the kept query again from the box puts them back there. A query typed
// afresh forgets its entry and starts at the top.
export const resultsScroll = new Map<string, number>();

/**
 * Closes the results. When they were opened over a page in this session, that
 * is a step back in history, so the page underneath returns with its scroll
 * position; a shared results link has nothing to go back to, so it just drops
 * the query.
 */
export const useCloseSearch = () => {
  const router = useRouter();

  return useCallback(() => {
    if (router.state.location.state.searchOverlay === true) {
      router.history.back();

      return;
    }

    void router.navigate({
      to: ".",
      search: (previous) => ({ ...previous, q: undefined }),
      replace: true,
      resetScroll: false,
    });
  }, [router]);
};
