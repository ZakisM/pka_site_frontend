import { EpisodeCard, gridStyles } from "@/ui/EpisodeCard";
import { atom, useAtomValue } from "jotai";
import { positionAtom, recentEpisodesAtom } from "@/player/playerState";
import type { EpisodeSummary } from "@/lib/api";
import { formatEpisodeNumber } from "@/lib/time";
import { useMemo } from "react";
import { watchProgress } from "@/lib/progress";

const MAX_CARDS = 4;

/** Episodes started but not finished, most recently opened first. */
export const ContinueWatching = ({ episodes }: { episodes: EpisodeSummary[] }) => {
  const recent = useAtomValue(recentEpisodesAtom);

  const started = useMemo(() => {
    const byNumber = new Map(episodes.map((episode) => [formatEpisodeNumber(episode.episodeNumber), episode]));

    return recent
      .map((episodeNumber) => byNumber.get(formatEpisodeNumber(episodeNumber)))
      .filter((episode) => episode !== undefined);
  }, [episodes, recent]);

  const positions = useAtomValue(
    useMemo(() => atom((get) => started.map((episode) => get(positionAtom(episode.videoId)))), [started]),
  );

  const inProgress = started
    .filter((episode, index) => {
      const progress = watchProgress(positions[index] ?? 0, episode.lengthSeconds);

      return progress !== undefined && !progress.finished;
    })
    .slice(0, MAX_CARDS);

  if (inProgress.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="mb-4 text-[15px] font-semibold">Continue watching</h2>
      <div className={gridStyles}>
        {inProgress.map((episode) => (
          <EpisodeCard key={episode.episodeNumber} episode={episode} />
        ))}
      </div>
    </section>
  );
};
