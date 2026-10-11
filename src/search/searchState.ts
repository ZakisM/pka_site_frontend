import type { SearchSort } from "@/lib/api";
import { atom } from "jotai";
import { useCallback } from "react";
import { useRouter } from "@tanstack/react-router";

declare module "@tanstack/react-router" {
  interface HistoryState {
    // Set on history entries the search field pushed over another page.
    searchOverlay?: boolean;
  }
}

// Kept for the session, so coming back to results keeps the chosen order.
export const searchSortAtom = atom<SearchSort>("newest");

/**
 * Closes the results. When they were opened over a page in this session, that
 * Is a step back in history, so the page underneath returns with its scroll
 * Position; a shared results link has nothing to go back to, so it just drops
 * The query.
 */
export const useCloseSearch = () => {
  const router = useRouter();

  return useCallback(() => {
    if (router.state.location.state.searchOverlay) {
      router.history.back();

      return;
    }

    router.navigate({
      to: ".",
      search: (previous) => ({ ...previous, q: undefined }),
      replace: true,
      resetScroll: false,
    });
  }, [router]);
};
