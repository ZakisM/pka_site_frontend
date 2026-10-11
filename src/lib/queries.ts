import { QueryClient, infiniteQueryOptions, keepPreviousData, queryOptions } from "@tanstack/react-query";
import { fetchEpisodeById, fetchEpisodes, fetchRelated, searchPage } from "./api";
import type { SearchSort } from "./api";

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60 * 1000 } },
});

export const episodeKey = (episodeId: string) => ["episode", episodeId];

export const episodeQuery = (episodeId: string) =>
  queryOptions({
    queryKey: episodeKey(episodeId),
    queryFn: async () => fetchEpisodeById(episodeId),
  });

// Every episode, newest first: the home grid, prev/next on the watch page and
// Continue watching all read this one list.
export const allEpisodesQuery = queryOptions({
  queryKey: ["episodes", "all"],
  queryFn: async ({ signal }) => fetchEpisodes(signal),
  staleTime: 5 * 60 * 1000,
});

// Moments elsewhere about the moment now playing. They only change when the
// Archive does, so they are cached for the session.
export const relatedQuery = (episodeNumber: number, timestamp: number) =>
  queryOptions({
    queryKey: ["related", episodeNumber, timestamp],
    queryFn: async ({ signal }) => fetchRelated(signal, episodeNumber, timestamp),
    staleTime: Infinity,
    // The section swaps when the next answer lands rather than blinking out.
    placeholderData: keepPreviousData,
  });

// Pages of grouped results. keepPreviousData holds the last term's results on
// Screen while the next one loads, so the list never blinks empty mid-type.
export const searchQuery = (query: string, sort: SearchSort) =>
  infiniteQueryOptions({
    queryKey: ["search", query, sort],
    queryFn: async ({ signal, pageParam }) => searchPage({ signal, query, sort, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextPage ?? undefined,
    placeholderData: keepPreviousData,
    // Kept long enough that reopening a recent search is instant, with every
    // Page that had been loaded.
    gcTime: 30 * 60 * 1000,
  });
