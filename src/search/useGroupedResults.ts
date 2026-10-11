import type { PkaEpisodeSearchResult, PkaEventSearchResult } from "@/lib_wasm";
import { allEpisodesQuery, episodeSearchQuery, momentSearchQuery } from "@/lib/queries";
import { useEffect, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatEpisodeNumber } from "@/lib/time";

export type ResultSort = "newest" | "matches";

export interface ResultGroup {
  episode: PkaEpisodeSearchResult;
  hits: PkaEventSearchResult[];
}

/**
 * One list, grouped by episode: every episode with a matching moment, plus any
 * Whose title matches. People remember a bit first and the episode second, so
 * Moments and episodes are not separate tabs.
 */
export const useGroupedResults = (query: string, sort: ResultSort) => {
  const queryClient = useQueryClient();
  const moments = useQuery(momentSearchQuery(query));
  const titles = useQuery(episodeSearchQuery(query));
  const all = useQuery(allEpisodesQuery);

  // Abort searches for a term already typed past rather than downloading and
  // Decoding them for nothing.
  const previousRef = useRef(query);

  useEffect(() => {
    const previous = previousRef.current;

    if (previous === query) {
      return;
    }

    previousRef.current = query;

    for (const options of [momentSearchQuery(previous), episodeSearchQuery(previous)]) {
      queryClient.cancelQueries({ queryKey: options.queryKey });
    }
  }, [query, queryClient]);

  const groups = useMemo(() => {
    if (!moments.data || !titles.data || !all.data) {
      return null;
    }

    const byNumber = new Map(all.data.map((episode) => [formatEpisodeNumber(episode.episodeNumber), episode]));
    const grouped = new Map<number, ResultGroup>();

    const groupFor = (episodeNumber: number) => {
      const key = formatEpisodeNumber(episodeNumber);
      let group = grouped.get(key);
      const episode = byNumber.get(key);

      if (!group && episode) {
        group = { episode, hits: [] };
        grouped.set(key, group);
      }

      return group;
    };

    for (const hit of moments.data) {
      groupFor(hit.episodeNumber)?.hits.push(hit);
    }

    for (const episode of titles.data) {
      groupFor(episode.episodeNumber);
    }

    const list = [...grouped.values()];

    for (const group of list) {
      group.hits = group.hits.toSorted((a, b) => a.timestamp - b.timestamp);
    }

    return list.toSorted((a, b) =>
      sort === "matches" && b.hits.length !== a.hits.length
        ? b.hits.length - a.hits.length
        : b.episode.episodeNumber - a.episode.episodeNumber,
    );
  }, [moments.data, titles.data, all.data, sort]);

  return {
    groups,
    momentCount: groups?.reduce((total, group) => total + group.hits.length, 0) ?? 0,
    // Previous results stay up while the next term loads; say so quietly.
    updating: moments.isPlaceholderData || titles.isPlaceholderData,
    error: moments.error ?? titles.error ?? all.error,
  };
};
