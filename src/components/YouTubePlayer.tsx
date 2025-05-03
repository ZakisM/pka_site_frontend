import {useRouterState} from '@tanstack/react-router';
import {useAtom} from 'jotai';
import {useEffect, useLayoutEffect, useRef} from 'react';
import YouTube, {type YouTubeEvent} from 'react-youtube';
import {playerTimestampAtom} from '@/atoms/playerAtoms';
import type {DataComponentProps, TimerId} from '@/types';

export const YouTubePlayer = ({
  videoId,
}: DataComponentProps<typeof YouTube>) => {
  const youtubeRef = useRef<YouTube>(null);
  const intervalRef = useRef<TimerId>(undefined);

  const [_, setPlayerTimestamp] = useAtom(playerTimestampAtom);

  const routerTimestampMeta = useRouterState({
    select(state) {
      return {timestamp: state.location.search.timestamp, status: state.status};
    },
  });

  useLayoutEffect(() => {
    return () => {
      clearInterval(intervalRef.current);

      setPlayerTimestamp(0);
    };
  }, []);

  useEffect(() => {
    if (routerTimestampMeta.status === 'idle') {
      youtubeRef.current
        ?.getInternalPlayer()
        .seekTo(routerTimestampMeta.timestamp);
    }
  }, [routerTimestampMeta]);

  const updatePlayerTimestamp = (event: YouTubeEvent<number>) => {
    setPlayerTimestamp(event.target.getCurrentTime());
  };

  return (
    <YouTube
      ref={youtubeRef}
      className="flex flex-grow-1"
      iframeClassName="w-full h-full"
      videoId={videoId}
      onReady={(event) => {
        event.target.seekTo(routerTimestampMeta.timestamp);
        event.target.playVideo();
      }}
      onStateChange={(event) => {
        clearInterval(intervalRef.current);

        updatePlayerTimestamp(event);

        intervalRef.current = setInterval(() => {
          updatePlayerTimestamp(event);
        }, 1_000);
      }}
    />
  );
};
