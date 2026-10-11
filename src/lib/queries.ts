import {
  QueryClient,
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
} from "@tanstack/react-query";
import { type SearchSort, fetchEpisodeById, fetchEpisodes, searchPage } from "./api";

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60 * 1000 } },
});

export const episodeKey = (episodeId: string) => ["episode", episodeId];

export const episodeQuery = (episodeId: string) =>
  queryOptions({
    queryKey: episodeKey(episodeId),
    queryFn: () => fetchEpisodeById(episodeId),
  });

// Every episode, newest first: the home grid, prev/next on the watch page and
// Continue watching all read this one list.
export const allEpisodesQuery = queryOptions({
  queryKey: ["episodes", "all"],
  queryFn: ({ signal }) => fetchEpisodes(signal),
  staleTime: 5 * 60 * 1000,
});

// Pages of grouped results. keepPreviousData holds the last term's results on
// Screen while the next one loads, so the list never blinks empty mid-type.
export const searchQuery = (query: string, sort: SearchSort) =>
  infiniteQueryOptions({
    queryKey: ["search", query, sort],
    queryFn: ({ signal, pageParam }) => searchPage({ signal, query, sort, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextPage ?? undefined,
    placeholderData: keepPreviousData,
  });
