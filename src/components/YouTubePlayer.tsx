import type { DataComponentProps, TimerId } from "@/types";
import YouTube, { type YouTubeEvent } from "react-youtube";
import { playerScrollRequestTriggerAtom, playerTimestampAtomFamily } from "@/atoms/playerAtoms";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";

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
  // eslint-disable-next-line no-useless-undefined
  const intervalRef = useRef<TimerId>(undefined);

  const setPlayerScrollRequestTrigger = useSetAtom(
    playerScrollRequestTriggerAtom,
  );
  const specificTimestampAtom = playerTimestampAtomFamily(videoId);
  const [playerTimestamp, setPlayerTimestamp] = useAtom(specificTimestampAtom);

  const updatePlayerTimestamp = (event: YouTubeEvent<number>) => {
    setPlayerTimestamp(event.target.getCurrentTime());
  };

  const routerTimestampMeta = useRouterState({
    select(state) {
      return {
        timestamp: state.location.search.timestamp,
        status: state.status,
      };
    },
  });

  useLayoutEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (routerTimestampMeta.status === "idle" && routerTimestampMeta.timestamp) {
      youtubeRef.current
        ?.getInternalPlayer()
        ?.seekTo(routerTimestampMeta.timestamp);
      setPlayerTimestamp(routerTimestampMeta.timestamp);
      setPlayerScrollRequestTrigger(Date.now());
    }
  }, [routerTimestampMeta]);

  return (
    <YouTube
      ref={youtubeRef}
      className="flex flex-grow"
      iframeClassName="w-full h-full"
      videoId={videoId}
      opts={{
        playerVars: {
          autoplay: 0,
        },
      }}
      onReady={(event) => {
        event.target.seekTo(playerTimestamp);
      }}
      onStateChange={(event) => {
        clearInterval(intervalRef.current);

        if (event.data === State.PLAYING) {
          updatePlayerTimestamp(event);

          intervalRef.current = setInterval(() => {
            updatePlayerTimestamp(event);
          }, 1000);
        }
      }}
    />
  );
};
