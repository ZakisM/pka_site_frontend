import { useActiveMoment, usePlaybackPosition, useStartPosition } from "./useWatchState";
import { EpisodeBar } from "./EpisodeBar";
import { MomentsRail } from "./MomentsRail";
import type { PkaEpisodeWithAll } from "@/lib/api";
import { Player } from "@/player/Player";
import { displayTitle } from "@/lib/titles";
import { formatEpisodeNumber } from "@/lib/time";
import { recentEpisodesAtom } from "@/player/playerState";
import { useEffect } from "react";
import { useSetAtom } from "jotai";

const RECENT_LIMIT = 30;

interface WatchScreenProps {
  episode: PkaEpisodeWithAll;
  urlTimestamp: unknown;
}

/**
 * The player, sized to leave the episode bar on screen, and the moments rail
 * Beside it (under it on phones). Nothing is drawn over the player: YouTube's
 * Own controls are the only chrome inside it.
 */
export const WatchScreen = ({ episode, urlTimestamp }: WatchScreenProps) => {
  const { videoId, title } = episode.youtubeDetails;
  const episodeNumber = episode.episode.number;
  const setRecent = useSetAtom(recentEpisodesAtom);

  const position = usePlaybackPosition(videoId);
  const activeIndex = useActiveMoment(episode.events, position);
  const start = useStartPosition(episodeNumber, urlTimestamp);

  useEffect(() => {
    setRecent((recent) => [
      { episodeNumber, videoId },
      ...recent.filter((entry) => entry.episodeNumber !== episodeNumber),
    ].slice(0, RECENT_LIMIT));
    document.title = `${formatEpisodeNumber(episodeNumber)} · ${displayTitle(title)} · PKA Index`;
  }, [episodeNumber, videoId, title, setRecent]);

  return (
    <div className="desktop:grid desktop:grid-cols-[minmax(0,1fr)_380px] max-[1100px]:desktop:grid-cols-[minmax(0,1fr)_330px]">
      <main className="min-w-0 px-8 pt-6 pb-14 max-[1100px]:px-5 max-[1100px]:pt-5 mobile:p-0 mobile:pb-1">
        <div className="watch-screen mx-auto">
          <div className="aspect-video w-full bg-black mobile:min-h-[200px]">
            <Player videoId={videoId} {...start} />
          </div>
          <EpisodeBar
            key={episodeNumber}
            episode={episode}
            startRequested={start.startSeconds !== undefined}
          />
        </div>
      </main>
      {/* Keyed per episode so its filter and follow state start fresh. */}
      <MomentsRail
        key={episodeNumber}
        events={episode.events}
        episodeNumber={episodeNumber}
        activeIndex={activeIndex}
        position={position}
      />
    </div>
  );
};
