import type { PkaEvent } from "@/lib/api";
import type { StartRequest } from "@/player/controller";
import { useLocation } from "@tanstack/react-router";
import { useMemo } from "react";

// A shared link's ?timestamp is an entry point, honoured when the page is
// Loaded with it. Its id is unique to this page load, so it is spent from then
// On: Back to it resumes where the viewer actually was, but a reload of the
// Link starts at its moment again.
const PAGE_LOAD = Date.now().toString(36);

const parseTimestamp = (timestamp: unknown) => {
  // A pasted link arrives as a string; anything unparseable is no timestamp.
  const parsed = Number(timestamp);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

/**
 * Where this episode should start, if anything asked: the navigation that
 * Opened it (see lib/intents), or a shared link. The player acts on each
 * Request once.
 */
export const useStartRequest = (episodeNumber: number, urlTimestamp: unknown): StartRequest | undefined => {
  // The location runs ahead of the screen while the next episode loads, so
  // Only a request for the episode on screen counts.
  const intent = useLocation({ select: (location) => location.state.playFrom });

  if (intent?.episodeNumber === episodeNumber) {
    return { id: intent.id, seconds: intent.seconds, play: true };
  }

  const seconds = parseTimestamp(urlTimestamp);

  return seconds === undefined
    ? undefined
    : { id: `url.${PAGE_LOAD}.${episodeNumber}.${seconds}`, seconds, play: false };
};

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
