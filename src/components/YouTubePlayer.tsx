import {useAtom} from 'jotai';
import {useEffect, useRef} from 'react';
import YouTube, {YouTubeEvent} from 'react-youtube';
import {playerTimestampAtom} from '@/atoms/playerAtoms';
import type {DataComponentProps, TimerId} from '@/types';
import {useSearch} from '@tanstack/react-router';

export const YouTubePlayer = ({
  videoId,
}: DataComponentProps<typeof YouTube>) => {
  const [, setPlayerTimestamp] = useAtom(playerTimestampAtom);
  const timestamp = useSearch({
    from: '/watch/$episodeId',
    select(state) {
      return state.timestamp;
    },
  });

  const youtubeRef = useRef<YouTube>(null);
  const intervalRef = useRef<TimerId>(undefined);

  useEffect(() => {
    setPlayerTimestamp(0);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [setPlayerTimestamp]);

  useEffect(() => {
    youtubeRef.current?.getInternalPlayer().seekTo(timestamp);
  }, [timestamp]);

  const updatePlayerTimestamp = async (event: YouTubeEvent<number>) => {
    setPlayerTimestamp(event.target.getCurrentTime());
  };

  return (
    <YouTube
      key={videoId}
      ref={youtubeRef}
      className="flex flex-grow-1"
      iframeClassName="w-full h-full"
      videoId={videoId}
      onReady={(event) => {
        event.target.seekTo(timestamp);
        event.target.playVideo();
      }}
      onStateChange={async (event) => {
        clearInterval(intervalRef.current);

        updatePlayerTimestamp(event);

        intervalRef.current = setInterval(() => {
          updatePlayerTimestamp(event);
        }, 1_000);
      }}
    />
  );
};
