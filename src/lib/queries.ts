import { HTTPError, fetchEpisodeById, fetchEpisodes, fetchRandomEvent, fetchRelated, searchPage } from "./api";
import { QueryClient, infiniteQueryOptions, keepPreviousData, queryOptions, skipToken } from "@tanstack/react-query";
import type { SearchSort } from "./api";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      // React Query's three retries, for loaders too (queryClient.query
      // doesn't retry unless told to), but not for a 4xx: that is the
      // answer, and retrying only delays "That episode isn't in the index".
      retry: (failures, error) => failures < 3 && !(error instanceof HTTPError && error.response.status < 500),
    },
  },
});

export const episodeKey = (episodeId: string) => ["episode", episodeId];

export const episodeQuery = (episodeId: string) =>
  queryOptions({
    queryKey: episodeKey(episodeId),
    queryFn: async () => fetchEpisodeById(episodeId),
  });

// For an answer that differs every time it is asked for (a random episode, a
// random moment, the latest episode): asked afresh on every use and dropped
// straight after, so React Query adds its retries and nothing else.
export const unkept = { staleTime: 0, gcTime: 0 } as const;

export const randomEventQuery = queryOptions({
  queryKey: ["event", "random"],
  queryFn: fetchRandomEvent,
  ...unkept,
});

// Every episode, newest first: the home grid, prev/next on the watch page and
// continue watching all read this one list.
export const allEpisodesQuery = queryOptions({
  queryKey: ["episodes", "all"],
  queryFn: async ({ signal }) => fetchEpisodes(signal),
  staleTime: 5 * 60 * 1000,
});

// Moments elsewhere about the moment now playing. They only change when the
// archive does, so they are cached for the session.
// With no moment playing (before the first starts) nothing is
// related, and that is known without asking: an answer like any other, so the
// section holds it until the first moment's own answer lands.
export const relatedQuery = (episodeNumber: number, timestamp: number | undefined) =>
  queryOptions({
    queryKey: ["related", episodeNumber, timestamp ?? null],
    queryFn: timestamp === undefined ? skipToken : async ({ signal }) => fetchRelated(signal, episodeNumber, timestamp),
    initialData: timestamp === undefined ? [] : undefined,
    staleTime: Infinity,
    gcTime: Infinity,
    // The section swaps when the next answer lands rather than blinking out.
    placeholderData: keepPreviousData,
  });

// Pages of grouped results. keepPreviousData holds the last term's results on
// screen while the next one loads, so the list never blinks empty mid-type.
export const searchQuery = (query: string, sort: SearchSort) =>
  infiniteQueryOptions({
    queryKey: ["search", query, sort],
    queryFn: async ({ signal, pageParam }) => searchPage({ signal, query, sort, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextPage ?? undefined,
    placeholderData: keepPreviousData,
    // Kept long enough that reopening a recent search is instant, with every
    // page that had been loaded.
    gcTime: 30 * 60 * 1000,
  });
