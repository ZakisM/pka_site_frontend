import type { CacheSnapshot } from "virtua";
import { atom } from "jotai";

export enum SearchTab {
  EPISODES = "episodes",
  EVENTS = "events",
}

export const searchOpenAtom = atom(false);
export const searchQueryAtom = atom("");
export const searchTabAtom = atom(SearchTab.EPISODES);
export const searchCountAtom = atom(0);
export const debouncedSearchQueryAtom = atom("");
export const scrollbarStateAtom = atom<{
  [key: string]: { offset: number; cache: CacheSnapshot };
}>({});
