import { EpisodeCard, EpisodeCardSkeleton, gridStyles } from "@/ui/EpisodeCard";
import { atom, useAtom } from "jotai";
import { pluralise, yearOf } from "@/lib/time";
import { useEffect, useMemo } from "react";
import { ContinueWatching } from "./ContinueWatching";
import { allEpisodesQuery } from "@/lib/queries";
import { useQuery } from "@tanstack/react-query";
import { useRevealMore } from "@/lib/hooks";

const PAGE = 24;

// Kept for the session, so Back from an episode returns to the same year.
const homeYearAtom = atom<number | null>(null);
const SKELETON_CARDS = Array.from({ length: 8 }, (_, index) => index);

/** Continue watching, then the whole archive newest first, by year if picked. */
export const HomeScreen = () => {
  const { data: episodes, error } = useQuery(allEpisodesQuery);
  const [year, setYear] = useAtom(homeYearAtom);

  const years = useMemo(
    () => [...new Set((episodes ?? []).map((episode) => yearOf(episode.uploadDate)))],
    [episodes],
  );
  const shown = useMemo(
    () => (year ? (episodes ?? []).filter((episode) => yearOf(episode.uploadDate) === year) : (episodes ?? [])),
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
        <div role="group" aria-label="Filter by year" className="-mx-1 flex min-w-0 gap-0.5 overflow-x-auto px-1 [scrollbar-width:none] mobile:pr-6 mobile:[mask-image:linear-gradient(to_right,#000_calc(100%-24px),transparent)]">
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
        </div>
        {episodes && (
          <span className="shrink-0 text-[13px] tabular-nums text-dim">
            {pluralise(shown.length, "episode")}
          </span>
        )}
      </div>

      <div className={gridStyles}>
        {episodes
          ? shown.slice(0, count).map((episode) => <EpisodeCard key={episode.episodeNumber} episode={episode} />)
          : SKELETON_CARDS.map((key) => <EpisodeCardSkeleton key={key} />)}
      </div>
      {hasMore && <div ref={sentinelRef} aria-hidden className="h-px" />}
    </div>
  );
};
