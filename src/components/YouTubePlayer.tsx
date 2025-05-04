import {useRouterState} from '@tanstack/react-router';
import {useSetAtom} from 'jotai';
import {useEffect, useLayoutEffect, useRef} from 'react';
import YouTube, {type YouTubeEvent} from 'react-youtube';
import {playerTimestampAtom} from '@/atoms/playerAtoms';
import type {DataComponentProps, TimerId} from '@/types';

enum State {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  VIDEO_CUED = 5,
}

export const YouTubePlayer = ({
  videoId,
}: DataComponentProps<typeof YouTube>) => {
  const youtubeRef = useRef<YouTube>(null);
  const intervalRef = useRef<TimerId>(undefined);

  const setPlayerTimestamp = useSetAtom(playerTimestampAtom);

  const updatePlayerTimestamp = (event: YouTubeEvent<number>) => {
    setPlayerTimestamp(event.target.getCurrentTime());
  };

  const routerTimestampMeta = useRouterState({
    select(state) {
      return {timestamp: state.location.search.timestamp, status: state.status};
    },
  });

  useLayoutEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (routerTimestampMeta.status === 'idle') {
      youtubeRef.current
        ?.getInternalPlayer()
        ?.seekTo(routerTimestampMeta.timestamp);
    }
  }, [routerTimestampMeta]);

  return (
    <YouTube
      ref={youtubeRef}
      className="flex flex-grow-1"
      iframeClassName="w-full h-full"
      videoId={videoId}
      opts={{
        playerVars: {
          autoplay: 0,
        },
      }}
      onReady={(event) => {
        event.target.seekTo(routerTimestampMeta.timestamp);
      }}
      onStateChange={(event) => {
        clearInterval(intervalRef.current);

        if (event.data === State.PLAYING) {
          updatePlayerTimestamp(event);

          intervalRef.current = setInterval(() => {
            updatePlayerTimestamp(event);
          }, 1_000);
        }
      }}
    />
  );
};
