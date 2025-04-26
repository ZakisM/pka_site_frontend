import {playerTimestampAtom} from '@/atoms/playerAtoms';
import type {DataComponentProps, TimerId} from '@/types';
import {useAtom} from 'jotai';
import {useEffect, useRef} from 'react';
import YouTube from 'react-youtube';

export const YouTubePlayer = ({
  videoId,
}: DataComponentProps<typeof YouTube>) => {
  const [, setPlayerTimestamp] = useAtom(playerTimestampAtom);

  const youtubeRef = useRef<YouTube>(null);
  const intervalRef = useRef<TimerId>(undefined);

  useEffect(() => {
    setPlayerTimestamp(0);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [setPlayerTimestamp]);

  return (
    <YouTube
      ref={youtubeRef}
      className="flex flex-grow-1"
      iframeClassName="w-full h-full"
      videoId={videoId}
      loading="lazy"
      onReady={() => {
        clearInterval(intervalRef.current);

        intervalRef.current = setInterval(async () => {
          const time = await youtubeRef.current
            ?.getInternalPlayer()
            ?.getCurrentTime();

          setPlayerTimestamp(time);
        }, 1_000);
      }}
    />
  );
};
