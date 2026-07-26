import { atom } from "jotai";

export const SEARCH_TABS = ["moments", "episodes"] as const;

export type SearchTab = (typeof SEARCH_TABS)[number];

// What a row draws, from either result shape, so there is one row component
// Instead of one per tab.
export interface SearchRow {
  key: string;
  episodeNumber: number;
  title: string;
  uploadDate: number;
  lengthSeconds: number;
  // Moments only — an episode result has no position in the video.
  timestamp?: number;
}

export const searchOpenAtom = atom(false);
// Survives closing the takeover, so reopening returns to the same results.
export const searchQueryAtom = atom("");
// Moments are the primary result type.
export const searchTabAtom = atom<SearchTab>("moments");
export const selectedIndexAtom = atom(0);
