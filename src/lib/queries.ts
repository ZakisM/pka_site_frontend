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
