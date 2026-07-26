import {
  useActiveMoment,
  usePlaybackPosition,
  useStartPosition,
} from "./useWatchState";
import { EpisodeMeta } from "./EpisodeMeta";
import { MomentsRail } from "./MomentsRail";
import type { PkaEpisodeWithAll } from "@/lib/api";
import { Player } from "@/player/Player";
import { PlayingNow } from "./PlayingNow";

interface WatchScreenProps {
  episode: PkaEpisodeWithAll;
  urlTimestamp: unknown;
}

/**
 * Player, then "where am I", then the episode's moments. On desktop the rail
 * Sits beside the player; on mobile it fills everything under it.
 */
export const WatchScreen = ({ episode, urlTimestamp }: WatchScreenProps) => {
  const { videoId } = episode.youtubeDetails;

  const position = usePlaybackPosition(videoId);
  const activeIndex = useActiveMoment(episode.events, position);
  const start = useStartPosition(episode.episode.number, urlTimestamp);

  return (
    <div className="flex h-full min-h-0 mobile:flex-col">
      <main className="flex min-h-0 min-w-0 flex-1 flex-col mobile:flex-none">
        <div className="flex min-w-0 flex-col bg-black mobile:aspect-video mobile:min-h-[200px] mobile:shrink-0 desktop:min-h-[300px] desktop:flex-1">
          <Player videoId={videoId} {...start} />
        </div>
        <PlayingNow
          event={episode.events[activeIndex]}
          nextEvent={episode.events[activeIndex + 1]}
          episodeNumber={episode.episode.number}
          position={position}
        />
        <EpisodeMeta episode={episode} />
      </main>
      {/* Keyed per episode: virtua otherwise carries the previous episode's
          scroll offset and its cache of row heights, which are indexed by
          position and so get applied to the new episode's rows until they are
          re-measured — leaving scrollToIndex computing against stale sizes. */}
      <MomentsRail
        key={episode.episode.number}
        events={episode.events}
        episodeNumber={episode.episode.number}
        activeIndex={activeIndex}
        position={position}
      />
    </div>
  );
};
