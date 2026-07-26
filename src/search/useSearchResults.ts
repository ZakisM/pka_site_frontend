import type { SearchRow, SearchTab } from "./searchState";
import { episodeSearchQuery, momentSearchQuery } from "@/lib/queries";
import { useEffect, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Results for the current term.
 *
 * Both tabs are fetched for the same term: the counts beside the tab labels
 * Are then always real, and switching tabs never waits on the network. An
 * Empty term returns the whole archive, which is where the totals come from.
 */
export const useSearchResults = (tab: SearchTab, query: string) => {
  const queryClient = useQueryClient();
  const moments = useQuery(momentSearchQuery(query));
  const episodes = useQuery(episodeSearchQuery(query));

  // Abort the searches for a term the viewer has already moved past rather
  // Than letting their payloads download and decode for nothing.
  const previousQueryRef = useRef(query);

  useEffect(() => {
    const previous = previousQueryRef.current;

    if (previous === query) {
      return;
    }

    previousQueryRef.current = query;

    for (const options of [momentSearchQuery(previous), episodeSearchQuery(previous)]) {
      queryClient.cancelQueries({ queryKey: options.queryKey });
    }
  }, [query, queryClient]);

  const onMoments = tab === "moments";

  // Only the visible tab is normalised, and only when its data changes: an
  // Unfiltered search is ~35k rows.
  const rows: SearchRow[] = useMemo(
    () =>
      onMoments
        ? (moments.data ?? []).map((item) => ({
            key: `${item.episodeNumber}-${item.timestamp}`,
            episodeNumber: item.episodeNumber,
            title: item.description,
            uploadDate: item.uploadDate,
            lengthSeconds: item.lengthSeconds,
            timestamp: item.timestamp,
          }))
        : (episodes.data ?? []).map((item) => ({
            key: String(item.episodeNumber),
            episodeNumber: item.episodeNumber,
            title: item.title,
            uploadDate: item.uploadDate,
            lengthSeconds: item.lengthSeconds,
          })),
    [onMoments, moments.data, episodes.data],
  );

  return {
    rows,
    momentCount: moments.data?.length ?? 0,
    episodeCount: episodes.data?.length ?? 0,
    loaded: (onMoments ? moments.data : episodes.data) !== undefined,
  };
};
