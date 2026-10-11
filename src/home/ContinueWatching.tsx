import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePositions, useRecentEpisodes } from "@/player/watchHistory";
import { EpisodeCard } from "@/ui/EpisodeCard";
import type { EpisodeSummary } from "@/lib/api";
import { formatEpisodeNumber } from "@/lib/time";
import { useMemo } from "react";
import { useShelf } from "./useShelf";
import { watchProgress } from "@/lib/progress";

// Every screen gets the same episodes; narrower ones scroll further.
const MAX_CARDS = 12;

const pageButton =
  "flex size-8 cursor-pointer items-center justify-center border border-line text-secondary transition-colors duration-150 hover:border-line-strong hover:text-ink disabled:cursor-default disabled:opacity-35 disabled:hover:border-line disabled:hover:text-secondary";

/** Episodes started but not finished, most recently opened first. */
export const ContinueWatching = ({ episodes }: { episodes: EpisodeSummary[] }) => {
  const recent = useRecentEpisodes();
  const positions = usePositions();

  const started = useMemo(() => {
    const byNumber = new Map(episodes.map((episode) => [formatEpisodeNumber(episode.episodeNumber), episode]));

    return recent
      .map((episodeNumber) => byNumber.get(formatEpisodeNumber(episodeNumber)))
      .filter((episode) => episode !== undefined);
  }, [episodes, recent]);

  const inProgress = started
    .filter((episode) => {
      const progress = watchProgress(positions.get(episode.videoId) ?? 0, episode.lengthSeconds);

      return progress !== undefined && !progress.finished;
    })
    .slice(0, MAX_CARDS);

  const { rowRef, edges, page } = useShelf(inProgress.length);

  if (inProgress.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-[15px] font-semibold">Continue watching</h2>
        {/* Phones swipe; desktops page with these when the row overflows. */}
        {!(edges.atStart && edges.atEnd) && (
          <div className="flex gap-1 mobile:hidden">
            <button
              type="button"
              aria-label="Scroll back"
              className={pageButton}
              disabled={edges.atStart}
              onClick={() => page(-1)}
            >
              <ChevronLeft className="size-4 stroke-[1.75]" />
            </button>
            <button
              type="button"
              aria-label="Scroll forward"
              className={pageButton}
              disabled={edges.atEnd}
              onClick={() => page(1)}
            >
              <ChevronRight className="size-4 stroke-[1.75]" />
            </button>
          </div>
        )}
      </div>
      {/* One row at every size. On phones it runs to the screen edges and the
          Next card peeks in, so it reads as something to swipe. */}
      <div
        ref={rowRef}
        className="grid snap-x snap-mandatory auto-cols-[var(--card-w,280px)] grid-flow-col gap-x-5 overflow-x-auto overscroll-x-contain [scrollbar-width:none] mobile:-mx-4 mobile:auto-cols-[78%] mobile:gap-x-3 mobile:scroll-px-4 mobile:px-4 xs:mobile:auto-cols-[44%]"
      >
        {inProgress.map((episode) => (
          <div key={episode.episodeNumber} className="min-w-0 snap-start">
            <EpisodeCard episode={episode} />
          </div>
        ))}
      </div>
    </section>
  );
};
