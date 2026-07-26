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

// "Seek the video already on screen" — a moments-rail or preview click.
export const seekRequestAtom = atom<{
  seconds: number;
  requestedAt: number;
} | null>(null);

// Set while a full-screen overlay covers the player. The player pauses for the
// Duration and resumes only if it was the one that paused it — so a video the
// Viewer had already paused stays paused.
export const playerObscuredAtom = atom(false);

// "Open this episode at this moment" — a search result or the random-moment
// Link. Deliberately state and not a URL param: ?timestamp is only an entry
// Point for shared links, and letting both drive the player made them fight.
// A back navigation would re-seek to the shared moment instead of resuming,
// And the param could reach the player a render before its episode did.
export const startIntentAtom = atom<{
  episodeNumber: number;
  seconds: number;
  requestedAt: number;
} | null>(null);
