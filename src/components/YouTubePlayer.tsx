import type { DataComponentProps, TimerId } from "@/types";
import YouTube, { type YouTubeEvent } from "react-youtube";
import {
  playerScrollRequestTriggerAtom,
  playerSeekRequestAtom,
  playerTimestampAtomFamily,
} from "@/atoms/playerAtoms";
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
  const [seekRequest, setSeekRequest] = useAtom(playerSeekRequestAtom);

  const updatePlayerTimestamp = (event: YouTubeEvent<number>) => {
    setPlayerTimestamp(event.target.getCurrentTime());
  };

  const navTimestamp = useRouterState({
    select: (state) => state.location.search.timestamp,
  });
  const navStatus = useRouterState({ select: (state) => state.status });
  const navKey = useRouterState({
    select: (state) => state.location.state.key,
  });

  // Tracks which navigation's ?timestamp has been applied.
  // Router state churn must not re-seek the player on every update.
  const consumedNavKeyRef = useRef<string | undefined>("__unconsumed__");

  useLayoutEffect(() => 
    () => {
      clearInterval(intervalRef.current);
    }
  , []);

  useEffect(() => {
    if (navStatus !== "idle" || !navTimestamp) {
      return;
    }

    if (consumedNavKeyRef.current === navKey) {
      return;
    }

    consumedNavKeyRef.current = navKey;

    youtubeRef.current?.getInternalPlayer()?.seekTo(navTimestamp);
    setPlayerTimestamp(navTimestamp);
    setPlayerScrollRequestTrigger(Date.now());
  }, [navTimestamp, navStatus, navKey, setPlayerTimestamp, setPlayerScrollRequestTrigger]);

  useEffect(() => {
    if (!seekRequest) {
      return;
    }

    const player = youtubeRef.current?.getInternalPlayer();
    player?.seekTo(seekRequest.seconds, true);
    player?.playVideo();
    setPlayerTimestamp(seekRequest.seconds);
    setSeekRequest(null);
  }, [seekRequest, setPlayerTimestamp, setSeekRequest]);

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
