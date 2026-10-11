import { EpisodeCard, gridStyles } from "./EpisodeCard";
import { atom, useAtomValue } from "jotai";
import { positionAtom, recentEpisodesAtom } from "@/player/playerState";
import type { PkaEpisodeSearchResult } from "@/lib_wasm";
import { formatEpisodeNumber } from "@/lib/time";
import { useMemo } from "react";
import { watchProgress } from "@/lib/progress";

const MAX_CARDS = 4;

/** Episodes started but not finished, most recently opened first. */
export const ContinueWatching = ({ episodes }: { episodes: PkaEpisodeSearchResult[] }) => {
  const recent = useAtomValue(recentEpisodesAtom);
  const positions = useAtomValue(
    useMemo(() => atom((get) => recent.map((entry) => get(positionAtom(entry.videoId)))), [recent]),
  );

  const byNumber = useMemo(
    () => new Map(episodes.map((episode) => [formatEpisodeNumber(episode.episodeNumber), episode])),
    [episodes],
  );

  const inProgress = recent
    .map((entry, index) => {
      const episode = byNumber.get(formatEpisodeNumber(entry.episodeNumber));
      const progress = episode && watchProgress(positions[index] ?? 0, episode.lengthSeconds);

      return progress && !progress.finished ? { episode, videoId: entry.videoId } : undefined;
    })
    .filter((card) => card !== undefined)
    .slice(0, MAX_CARDS);

  if (inProgress.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="mb-4 text-[15px] font-semibold">Continue watching</h2>
      <div className={gridStyles}>
        {inProgress.map(({ episode, videoId }) => (
          <EpisodeCard key={episode.episodeNumber} episode={episode} videoId={videoId} />
        ))}
      </div>
    </section>
  );
};
