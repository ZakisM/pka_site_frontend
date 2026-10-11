import {
  QueryClient,
  keepPreviousData,
  queryOptions,
} from "@tanstack/react-query";
import { fetchEpisodeById, searchEpisodes, searchEvents } from "./api";

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
// The episode details beside each search hit all read this one list. An empty
// Query returns the whole archive (~800 rows, ~30KB).
export const allEpisodesQuery = queryOptions({
  queryKey: ["episodes", "all"],
  queryFn: ({ signal }) => searchEpisodes(signal, ""),
  select: (episodes) => episodes.toSorted((a, b) => b.episodeNumber - a.episodeNumber),
  staleTime: 5 * 60 * 1000,
});

// KeepPreviousData holds the last results on screen while the next term is in
// Flight, so the list never blinks empty mid-type.
export const momentSearchQuery = (query = "") =>
  queryOptions({
    queryKey: ["search", "moments", query],
    queryFn: ({ signal }) => searchEvents(signal, query),
    placeholderData: keepPreviousData,
  });

export const episodeSearchQuery = (query = "") =>
  queryOptions({
    queryKey: ["search", "episodes", query],
    queryFn: ({ signal }) => searchEpisodes(signal, query),
    placeholderData: keepPreviousData,
  });
