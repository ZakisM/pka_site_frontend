import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

type PositionAtom = ReturnType<typeof atomWithStorage<number>>;

const positions = new Map<string, PositionAtom>();

/**
 * Playback position for a video, persisted so an episode resumes where it was
 * Left. GetOnInit makes it readable synchronously via `store.get` — without it
 * The atom reads 0 until mounted, and videos would resume from the start.
 *
 * A hand-rolled cache rather than jotai's atomFamily, which is deprecated in
 * Favour of a separate package we do not need for one lookup.
 */
export const positionAtom = (videoId: string) => {
  const existing = positions.get(videoId);

  if (existing) {
    return existing;
  }

  const created = atomWithStorage(videoId, 0, undefined, { getOnInit: true });

  positions.set(videoId, created);

  return created;
};

export interface RecentEpisode {
  episodeNumber: number;
  videoId: string;
}

// Most recently opened first. Positions are keyed by video id alone, so this
// Is what lets the home page order "Continue watching" and map a stored
// Position back to its episode.
export const recentEpisodesAtom = atomWithStorage<RecentEpisode[]>(
  "recent-episodes",
  [],
  undefined,
  { getOnInit: true },
);

// "Seek the video already on screen" — a moments-rail click.
export const seekRequestAtom = atom<{
  seconds: number;
  requestedAt: number;
} | null>(null);

// Set while the search page hides the player. The player pauses for the
// Duration and resumes only if it was the one that paused it — so a video the
// Viewer had already paused stays paused.
export const playerObscuredAtom = atom(false);

// "Open this episode at this moment" — a search hit, a continue-watching card
// Or the random-moment link. Deliberately state and not a URL param: ?timestamp is only an entry
// Point for shared links, and letting both drive the player made them fight.
// A back navigation would re-seek to the shared moment instead of resuming,
// And the param could reach the player a render before its episode did.
export const startIntentAtom = atom<{
  episodeNumber: number;
  seconds: number;
  requestedAt: number;
} | null>(null);
