import { createStore, useStore } from "@/lib/store";
import { readJson, storageKeys, writeJson } from "@/lib/storage";
import { useSyncExternalStore } from "react";

const local = () => localStorage;

// Positions are kept as a JSON number under the bare video id, which is how
// They have always been stored, so progress saved before carries over.
const VIDEO_ID = /^[\w-]{11}$/u;

const loadPositions = () => {
  const loaded = new Map<string, number>();

  for (const key of storageKeys(local)) {
    const value = VIDEO_ID.test(key) ? readJson(local, key) : undefined;

    if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      loaded.set(key, value);
    }
  }

  return loaded;
};

/**
 * How far into each video the viewer got, so an episode resumes where it was
 * left. Replaced rather than mutated on every change, so a render always sees
 * one consistent snapshot.
 */
const positions = createStore<ReadonlyMap<string, number>>(loadPositions());

export const positionOf = (videoId: string) => positions.get().get(videoId) ?? 0;

export const savePosition = (videoId: string, seconds: number) => {
  if (positions.get().get(videoId) === seconds) {
    return;
  }

  positions.set((previous) => new Map(previous).set(videoId, seconds));
  writeJson(local, videoId, seconds);
};

export const usePosition = (videoId: string) => useSyncExternalStore(positions.subscribe, () => positionOf(videoId));

export const usePositions = () => useStore(positions);

const RECENT_KEY = "recent-episodes";
const RECENT_LIMIT = 30;

const loadRecent = () => {
  const stored = readJson(local, RECENT_KEY);

  return Array.isArray(stored) ? stored.filter((value) => typeof value === "number") : [];
};

// Episode numbers, most recently opened first: the order of the home page's
// "Continue watching". Positions alone carry no time, so they can't order it.
const recentEpisodes = createStore<readonly number[]>(loadRecent(), (value) => writeJson(local, RECENT_KEY, value));

export const useRecentEpisodes = () => useStore(recentEpisodes);

// Another tab watching keeps this one current. Taking its value back writes
// The same string, which raises no further event, so tabs can't ping-pong.
globalThis.addEventListener("storage", ({ storageArea, key, newValue }) => {
  if (storageArea !== localStorage || key === null) {
    return;
  }

  if (key === RECENT_KEY) {
    recentEpisodes.set(loadRecent());
  } else if (VIDEO_ID.test(key)) {
    const value = Number(newValue);

    if (newValue !== null && Number.isFinite(value) && value >= 0) {
      positions.set((previous) => new Map(previous).set(key, value));
    }
  }
});

export const markRecent = (episodeNumber: number) => {
  recentEpisodes.set((recent) =>
    recent[0] === episodeNumber
      ? recent
      : [episodeNumber, ...recent.filter((number) => number !== episodeNumber)].slice(0, RECENT_LIMIT),
  );
};
