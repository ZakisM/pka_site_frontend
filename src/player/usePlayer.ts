import {
  type PlayerEvent,
  PlayerState,
  type YouTubePlayer,
  loadYouTubeApi,
} from "@/lib/youtube";
import { playerObscuredAtom, positionAtom, seekRequestAtom } from "./playerState";
import { useAtom, useAtomValue, useStore } from "jotai";
import { useEffect, useRef, useState } from "react";

export interface PlayerRequest {
  videoId: string;
  // Where this episode should start, if something asked for a position.
  startSeconds?: number;
  // Identifies that request, so asking twice seeks twice.
  startKey?: string;
}

// How far the reported position may sit from the requested one before the seek
// Counts as not having landed.
const TOLERANCE_SECONDS = 2;
const SEEK_ATTEMPTS = 3;
// Long enough for a cue to take effect, short enough to be invisible.
const CUE_VERIFY_MS = 600;

/**
 * Owns one YouTube iframe for the lifetime of the page and reconciles it
 * Against `request`. Nothing else touches the player: episode changes and
 * Start positions arrive as props, in-episode seeks arrive via `seekRequestAtom`.
 */
export const usePlayer = ({ videoId, startSeconds, startKey }: PlayerRequest) => {
  const store = useStore();
  const [seekRequest, setSeekRequest] = useAtom(seekRequestAtom);
  const obscured = useAtomValue(playerObscuredAtom);
  const [ready, setReady] = useState(false);

  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  // eslint-disable-next-line no-useless-undefined
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // What should be on screen. The player is reconciled against these, so a
  // Navigation arriving before the player exists is simply applied later.
  const wantedVideoRef = useRef(videoId);
  const consumedKeyRef = useRef(startKey);

  // A position asked for but not yet reached. Playback can begin before a seek
  // Lands, and publishing that pre-seek 0 would drop the UI to the Intro.
  const settlingRef = useRef<{ seconds: number; attempts: number } | null>(null);
  // Set while a cued video waits to be positioned and played.
  const awaitingCueRef = useRef(false);
  // Whether playback was ours to interrupt, and ours to restore.
  const playingRef = useRef(false);
  const resumeWhenRevealedRef = useRef(false);

  const [initialStart] = useState(
    () => startSeconds ?? store.get(positionAtom(videoId)),
  );
  // Where the player should start when it is finally constructed. Kept in a
  // Ref because a navigation can land while the API script is still in flight,
  // And the iframe must then be created from the episode we ended up on.
  const wantedStartRef = useRef(initialStart);

  const publish = (seconds: number) => {
    store.set(positionAtom(wantedVideoRef.current), seconds);
  };

  const hold = (seconds: number) => {
    settlingRef.current = seconds > 0 ? { seconds, attempts: 0 } : null;
    publish(seconds);
  };

  const readPosition = (player: YouTubePlayer) => {
    // Right after a switch the player still reports the previous video's
    // Clock; that time means nothing for the episode now on screen.
    if (player.getVideoData()?.video_id !== wantedVideoRef.current) {
      return;
    }

    const currentTime = player.getCurrentTime();
    const settling = settlingRef.current;

    if (settling) {
      if (Math.abs(currentTime - settling.seconds) <= TOLERANCE_SECONDS) {
        settlingRef.current = null;
      } else if (settling.attempts < SEEK_ATTEMPTS) {
        settling.attempts += 1;
        player.seekTo(settling.seconds, true);

        return;
      } else {
        // Give up and tell the truth rather than keep lying about position.
        settlingRef.current = null;
      }
    }

    publish(currentTime);
  };

  const showVideo = (
    player: YouTubePlayer,
    nextVideoId: string,
    seconds: number,
  ) => {
    wantedVideoRef.current = nextVideoId;
    awaitingCueRef.current = true;
    // This takes over playback, so there is nothing left to restore.
    resumeWhenRevealedRef.current = false;
    hold(seconds);

    // Pause first: a cue issued mid-playback is precisely the call that used
    // To be dropped. Cue rather than load because loading autoplays, and an
    // Autoplay that ignores startSeconds is the "starts at 0 then jumps" bug.
    player.pauseVideo();
    player.cueVideoById(nextVideoId, Math.floor(seconds));

    // Self-heal: if the swap did not take, force it with a load, which is
    // Never dropped.
    setTimeout(() => {
      const live = playerRef.current;

      if (
        live &&
        wantedVideoRef.current === nextVideoId &&
        live.getVideoData()?.video_id !== nextVideoId
      ) {
        live.loadVideoById(nextVideoId, Math.floor(seconds));
      }
    }, CUE_VERIFY_MS);
  };

  const onStateChange = ({ target: player, data: state }: PlayerEvent) => {
    clearInterval(intervalRef.current);

    if (state === PlayerState.VIDEO_CUED && awaitingCueRef.current) {
      awaitingCueRef.current = false;
      // Seeking a cued video does not start it, so the position is corrected
      // While nothing is on screen yet.
      player.seekTo(settlingRef.current?.seconds ?? 0, true);
      player.playVideo();

      return;
    }

    playingRef.current = state === PlayerState.PLAYING;

    if (state === PlayerState.PLAYING) {
      readPosition(player);
      intervalRef.current = setInterval(() => readPosition(player), 1000);

      return;
    }

    // Pausing, buffering and ending all move the playhead — YouTube's scrubber
    // Is the only one now, so without this the UI goes stale after a scrub.
    if (
      state === PlayerState.PAUSED ||
      state === PlayerState.BUFFERING ||
      state === PlayerState.ENDED
    ) {
      readPosition(player);
    }
  };

  // Created exactly once; episode changes swap the video inside it.
  useEffect(() => {
    let disposed = false;

    loadYouTubeApi().then((YT) => {
      if (disposed || !hostRef.current || playerRef.current) {
        return;
      }

      playerRef.current = new YT.Player(hostRef.current, {
        // Current state, not the mount-time snapshot: see wantedStartRef.
        videoId: wantedVideoRef.current,
        playerVars: {
          autoplay: 0,
          // YouTube's own controls are the only in-frame chrome: nothing of
          // Ours may sit over the iframe, per the embed terms.
          controls: 1,
          playsinline: 1,
          rel: 0,
          start: Math.floor(wantedStartRef.current),
        },
        events: {
          onReady: () => {
            setReady(true);

            // PlayerVars.start positions the video but tells the app nothing,
            // And early frames can still report 0 — hold the position so the
            // UI does not blink to the Intro on first play.
            if (wantedStartRef.current > 0) {
              hold(wantedStartRef.current);
            }
          },
          onStateChange,
        },
      });
    });

    return () => {
      disposed = true;
      clearInterval(intervalRef.current);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
    // eslint-disable-next-line exhaustive-deps
  }, []);

  // Episode changes and start requests.
  useEffect(() => {
    const player = playerRef.current;
    const isFreshRequest =
      startSeconds !== undefined && consumedKeyRef.current !== startKey;

    if (wantedVideoRef.current !== videoId) {
      // Consume either way, so a later render cannot replay this request.
      consumedKeyRef.current = startKey;

      const seconds = isFreshRequest
        ? startSeconds
        : store.get(positionAtom(videoId));

      if (player) {
        showVideo(player, videoId, seconds);
      } else {
        // Not ready yet: record where we should be, and let the constructor
        // Above start there once the API arrives.
        wantedVideoRef.current = videoId;
        wantedStartRef.current = seconds;
        publish(seconds);
      }

      return;
    }

    if (isFreshRequest && player) {
      consumedKeyRef.current = startKey;
      resumeWhenRevealedRef.current = false;
      hold(startSeconds);
      player.seekTo(startSeconds, true);
      player.playVideo();
    }
    // eslint-disable-next-line exhaustive-deps
  }, [videoId, startSeconds, startKey]);

  // Pause while an overlay covers the player, and pick up where we left off.
  useEffect(() => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    if (obscured) {
      if (playingRef.current) {
        resumeWhenRevealedRef.current = true;
        player.pauseVideo();
      }

      return;
    }

    if (resumeWhenRevealedRef.current) {
      resumeWhenRevealedRef.current = false;
      player.playVideo();
    }
  }, [obscured]);

  // In-episode seeks from the moments rail and the search preview.
  useEffect(() => {
    if (!seekRequest) {
      return;
    }

    hold(seekRequest.seconds);
    playerRef.current?.seekTo(seekRequest.seconds, true);
    playerRef.current?.playVideo();
    setSeekRequest(null);
    // eslint-disable-next-line exhaustive-deps
  }, [seekRequest]);

  return { hostRef, ready };
};
