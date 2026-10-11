import { useActiveMoment, usePlaybackPosition, useStartPosition } from "./useWatchState";
import { EpisodeBar } from "./EpisodeBar";
import { MomentsRail } from "./MomentsRail";
import { MoreEpisodes } from "./MoreEpisodes";
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
 * The player, sized to leave the episode bar on screen, with the moments
 * Pinned beside it and neighbouring episodes below (on phones: player, bar,
 * Moments, episodes). Nothing is drawn over the player: YouTube's own controls
 * Are the only chrome inside it.
 */
export const WatchScreen = ({ episode, urlTimestamp }: WatchScreenProps) => {
  const { videoId, title } = episode.youtubeDetails;
  const episodeNumber = episode.episode.number;
  const setRecent = useSetAtom(recentEpisodesAtom);

  const position = usePlaybackPosition(videoId);
  const activeIndex = useActiveMoment(episode.events, position);
  const start = useStartPosition(episodeNumber, urlTimestamp);

  useEffect(() => {
    setRecent((recent) =>
      [episodeNumber, ...recent.filter((number) => number !== episodeNumber)].slice(0, RECENT_LIMIT),
    );
    document.title = `${formatEpisodeNumber(episodeNumber)} · ${displayTitle(title)} · PKA Index`;
  }, [episodeNumber, title, setRecent]);

  return (
    <div className="desktop:grid desktop:grid-cols-[minmax(0,1fr)_380px]">
      <main className="min-w-0 px-8 pt-6 mobile:p-0">
        <div className="watch-width @container mx-auto">
          <div className="aspect-video w-full bg-black mobile:min-h-[200px]">
            <Player videoId={videoId} {...start} />
          </div>
          <EpisodeBar key={episodeNumber} episode={episode} />
        </div>
      </main>
      {/* Keyed per episode so its filter and follow state start fresh. Spans
          Both rows so it stays pinned beside the player and the episodes. */}
      <MomentsRail
        key={episodeNumber}
        events={episode.events}
        episodeNumber={episodeNumber}
        activeIndex={activeIndex}
      />
      <div className="px-8 pt-10 pb-14 desktop:col-start-1 desktop:row-start-2 mobile:px-0 mobile:pt-8">
        <div className="watch-width mx-auto">
          <MoreEpisodes episodeNumber={episodeNumber} />
        </div>
      </div>
    </div>
  );
};
