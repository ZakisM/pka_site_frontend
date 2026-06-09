import type {
  PkaEpisodeSearchResult,
  PkaEventSearchResult,
} from "@/lib_wasm.ts";
import {
  SearchTab,
  scrollbarStateAtom,
  searchCountAtom,
  searchOpenAtom,
  searchSelectedIndexAtom,
} from "@/atoms/searchAtoms.ts";
import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import {
  searchEpisodeQueryOptions,
  searchEventQueryOptions,
} from "@/utils/queryOptions.ts";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useSetAtom, useStore } from "jotai";
import { EpisodeSearchResult } from "./EpisodeSearchResult.tsx";
import { EventSearchResult } from "./EventSearchResult.tsx";
import type { SearchNavigateOptions } from "./SearchResultCard.tsx";
import { SearchX } from "lucide-react";
import type { VListHandle } from "virtua";
import { VirtualizedScrollbar } from "./Scrollbar.tsx";
import { useNavigate } from "@tanstack/react-router";

type SearchResultItem = PkaEpisodeSearchResult | PkaEventSearchResult;

interface SearchConfig<T extends SearchResultItem = any> {
  Component: React.ComponentType<{ item: T; index: number }>;
  queryFn: (searchQuery?: string) => UseQueryOptions<T[], Error, T[], T[]>;
  searchTab: SearchTab;
  itemKey: (item: T) => string;
  navigateOptions: (item: T) => SearchNavigateOptions;
}

export const searchConfigMap = {
  [SearchTab.EPISODES]: {
    searchTab: SearchTab.EPISODES,
    Component: EpisodeSearchResult,
    queryFn: searchEpisodeQueryOptions,
    itemKey: ({ episodeNumber }: PkaEpisodeSearchResult) =>
      episodeNumber.toString(),
    navigateOptions: ({ episodeNumber }: PkaEpisodeSearchResult) => ({
      to: "/watch/$episodeId" as const,
      params: { episodeId: episodeNumber.toString() },
    }),
  },
  [SearchTab.EVENTS]: {
    searchTab: SearchTab.EVENTS,
    Component: EventSearchResult,
    queryFn: searchEventQueryOptions,
    itemKey: ({ episodeNumber, timestamp }: PkaEventSearchResult) =>
      `${episodeNumber}-${timestamp}`,
    navigateOptions: ({ episodeNumber, timestamp }: PkaEventSearchResult) => ({
      to: "/watch/$episodeId" as const,
      params: { episodeId: episodeNumber.toString() },
      search: { timestamp },
    }),
  },
} as const satisfies Record<SearchTab, SearchConfig>;

export const GenericSearchContent = ({
  config,
  searchQuery,
}: {
  config: SearchConfig;
  searchQuery: string;
}) => {
  const prevSearchQuery = useRef(searchQuery);
  const vScrollBarRef = useRef<VListHandle | null>(null);

  const { data, isFetched } = useQuery(config.queryFn(searchQuery));

  const navigate = useNavigate();
  const setSearchOpen = useSetAtom(searchOpenAtom);
  const setSearchCount = useSetAtom(searchCountAtom);
  const setScrollbarState = useSetAtom(scrollbarStateAtom);

  // Read the selection imperatively rather than subscribing.
  // Subscribing here would rebuild the full children array (potentially 35k elements) on every selection move.
  const store = useStore();
  const setSelectedIndex = useSetAtom(searchSelectedIndexAtom);

  // Reset selection when switching tabs (this component remounts per tab).
  useLayoutEffect(() => {
    setSelectedIndex(0);
  }, [setSelectedIndex]);

  useLayoutEffect(() => {
    if (isFetched && prevSearchQuery.current !== searchQuery) {
      vScrollBarRef.current?.scrollTo(0);
      setScrollbarState({});
      setSelectedIndex(0);

      prevSearchQuery.current = searchQuery;
    }
  }, [searchQuery, setScrollbarState, setSelectedIndex, isFetched]);

  useEffect(() => {
    setSearchCount(data?.length ?? 0);
  }, [data, setSearchCount]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!data?.length) {
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();

        setSelectedIndex((prev) => {
          const next =
            event.key === "ArrowDown"
              ? Math.min(prev + 1, data.length - 1)
              : Math.max(prev - 1, 0);

          vScrollBarRef.current?.scrollToIndex(next, { align: "nearest" });

          return next;
        });
      } else if (event.key === "Enter") {
        event.preventDefault();

        const item = data[store.get(searchSelectedIndexAtom)];

        if (item) {
          navigate(config.navigateOptions(item));
          setSearchOpen(false);
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [data, store, navigate, config, setSearchOpen, setSelectedIndex]);

  // Nothing cached yet (very first load) — render nothing rather than a momentary "no results" flash.
  // Afterwards keepPreviousData keeps `data` populated through refetches, so the empty state stays stable while typing.
  if (!data) {
    return null;
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-grow flex-col items-center justify-center gap-2 p-6 text-center">
        <SearchX className="size-5 text-zinc-600" />
        <p className="text-sm text-zinc-400">
          No results
          {searchQuery && (
            <>
              {" "}
              for{" "}
              <span className="break-all text-zinc-200">
                &ldquo;{searchQuery}&rdquo;
              </span>
            </>
          )}
        </p>
        <p className="text-xs text-zinc-600">Try a different search term</p>
      </div>
    );
  }

  return (
    <VirtualizedScrollbar
      scrollKey={config.searchTab}
      className="my-2 flex grow px-3"
      vScrollbarRef={vScrollBarRef}
    >
      {data.map((item, index) => (
        <config.Component
          key={config.itemKey(item)}
          item={item}
          index={index}
        />
      ))}
    </VirtualizedScrollbar>
  );
};

