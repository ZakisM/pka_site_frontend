import { positionAtom, startIntentAtom } from "@/player/playerState";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import type { PkaEvent } from "@/lib/api";

// A shared link's ?timestamp is an entry point, not app state: honour it once
// Per page load and never again, so a back navigation resumes where the viewer
// Actually was instead of replaying the link's moment.
let urlTimestampConsumed = false;

const consumeUrlTimestamp = (timestamp: unknown) => {
  if (urlTimestampConsumed) {
    return;
  }

  urlTimestampConsumed = true;

  // A pasted link arrives as a string; anything unparseable is no timestamp.
  const parsed = Number(timestamp);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

/**
 * Where this episode should start, from the one source allowed to say so.
 * Returns props for the player: they travel together, so a position can never
 * Reach the player a render before the episode it belongs to.
 */
export const useStartPosition = (
  episodeNumber: number,
  urlTimestamp: unknown,
) => {
  const [intent, setIntent] = useAtom(startIntentAtom);
  const [urlStart] = useState(() => consumeUrlTimestamp(urlTimestamp));

  // Only an intent aimed at the episode now on screen may touch the player.
  const forThisEpisode =
    intent?.episodeNumber === episodeNumber ? intent : undefined;

  useEffect(() => {
    if (forThisEpisode) {
      setIntent(null);
    }
  }, [forThisEpisode, setIntent]);

  return {
    startSeconds: forThisEpisode?.seconds ?? urlStart,
    // A constant for the URL case so it is never mistaken for a fresh request;
    // It only ever seeds the player's initial construction.
    startKey: forThisEpisode ? String(forThisEpisode.requestedAt) : "url",
  };
};

/** Live playback position for a video, in seconds. */
export const usePlaybackPosition = (videoId: string) =>
  useAtomValue(positionAtom(videoId));

/**
 * Index of the moment currently playing. Derived rather than stored: the
 * Position updates once a second and any state here would need resetting on
 * Every episode change. Events are ordered, so the active one is the last that
 * Has started — which also covers gaps between moments.
 */
export const useActiveMoment = (events: PkaEvent[], position: number) =>
  useMemo(() => {
    let active = 0;

    for (const [index, event] of events.entries()) {
      if (event.timestamp > position) {
        break;
      }

      active = index;
    }

    return active;
  }, [events, position]);
