import { EpisodeCard, EpisodeCardSkeleton } from "@/ui/EpisodeCard";
import { createStore, useStore } from "@/lib/store";
import { pluralise, yearOf } from "@/lib/time";
import { useEffect, useMemo } from "react";
import { ContinueWatching } from "./ContinueWatching";
import { allEpisodesQuery } from "@/lib/queries";
import { useQuery } from "@tanstack/react-query";
import { useRevealMore } from "@/lib/hooks";

const PAGE = 24;

const gridStyles =
  "grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-x-5 gap-y-9 mobile:grid-cols-1 mobile:gap-y-7 xs:mobile:grid-cols-2 xs:mobile:gap-x-3";

// Kept for the session, so Back from an episode returns to the same year.
const homeYear = createStore<number | null>(null);
const SKELETON_CARDS = Array.from({ length: 8 }, (_, index) => index);

/** Continue watching, then the whole archive newest first, by year if picked. */
export const HomeScreen = () => {
  const { data: episodes, error } = useQuery(allEpisodesQuery);
  const year = useStore(homeYear);
  const setYear = homeYear.set;

  const years = useMemo(() => [...new Set((episodes ?? []).map((episode) => yearOf(episode.uploadDate)))], [episodes]);
  const shown = useMemo(
    () =>
      year === null ? (episodes ?? []) : (episodes ?? []).filter((episode) => yearOf(episode.uploadDate) === year),
    [episodes, year],
  );
  const { count, hasMore, sentinelRef } = useRevealMore(shown.length, PAGE, `home:${year ?? "all"}`);

  useEffect(() => {
    document.title = "PKA Index";
  }, []);

  if (error) {
    throw error;
  }

  return (
    <div className="px-6 pt-8 pb-18 mobile:px-4 mobile:pt-6 mobile:pb-14">
      {episodes && <ContinueWatching episodes={episodes} />}

      <div className="mb-6 flex items-center justify-between gap-4">
        <fieldset
          aria-label="Filter by year"
          className="-mx-1 flex min-w-0 gap-0.5 overflow-x-auto px-1 [scrollbar-width:none] mobile:pr-6 mobile:[mask-image:linear-gradient(to_right,#000_calc(100%-24px),transparent)]"
        >
          {[null, ...years].map((option) => (
            <button
              key={option ?? "all"}
              type="button"
              aria-pressed={year === option}
              className="shrink-0 cursor-pointer border-b-2 border-transparent px-[11px] py-[7px] text-[13px] tabular-nums text-muted transition-colors duration-150 hover:text-ink aria-pressed:border-primary aria-pressed:text-ink"
              onClick={() => setYear(option)}
            >
              {option ?? "All"}
            </button>
          ))}
        </fieldset>
        {episodes && (
          <span className="shrink-0 text-[13px] tabular-nums text-dim">{pluralise(shown.length, "episode")}</span>
        )}
      </div>

      {/* Keyed by year, so a new year's episodes fade in rather than snap. */}
      <div key={year ?? "all"} className={`${gridStyles} animate-fade-in`}>
        {episodes
          ? shown.slice(0, count).map((episode) => <EpisodeCard key={episode.episodeNumber} episode={episode} />)
          : SKELETON_CARDS.map((key) => <EpisodeCardSkeleton key={key} />)}
      </div>
      {hasMore && <div ref={sentinelRef} aria-hidden className="h-px" />}
    </div>
  );
};
