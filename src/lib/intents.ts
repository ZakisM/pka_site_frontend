import { readJson, writeJson } from "./storage";
import type { HistoryState } from "@tanstack/react-router";

// What a navigation asks the watch page to do when it arrives. Carried in that
// History entry's state, not the URL — the address bar is for sharing — and
// Not in global state, where a request could outlive its navigation (one
// Cancelled by Back, say) and ambush the next visit to that episode.
//
// Each request is scoped to its episode, because the location runs ahead of
// The screen while an episode loads, and has an id so it is acted on once:
// Back to the entry, or a reload, resumes instead of replaying it.

interface Intent {
  id: string;
  episodeNumber: number;
}

// "Open this episode at this moment": a search hit, a related moment, the
// Random moment.
export interface PlayFrom extends Intent {
  seconds: number;
}

// "Open this episode with its moments filtered": a search's "N more moments".
export interface FilterMoments extends Intent {
  filter: string;
}

declare module "@tanstack/react-router" {
  interface HistoryState {
    playFrom?: PlayFrom;
    filterMoments?: FilterMoments;
  }
}

let created = 0;

const newId = () => {
  created += 1;

  return `${Date.now().toString(36)}.${created.toString(36)}`;
};

export const playFrom = (episodeNumber: number, seconds: number): HistoryState => ({
  playFrom: { id: newId(), episodeNumber, seconds },
});

export const filterMoments = (episodeNumber: number, filter: string): HistoryState => ({
  filterMoments: { id: newId(), episodeNumber, filter },
});

// Requests already acted on. Per tab, like the history entries they live in,
// So a reload remembers them too.
const SPENT_KEY = "spent-intents";
const SPENT_LIMIT = 100;
const session = () => sessionStorage;

const loadSpent = () => {
  const stored = readJson(session, SPENT_KEY);

  return new Set<string>(Array.isArray(stored) ? stored.filter((value) => typeof value === "string") : []);
};

const spent = loadSpent();

export const isSpent = (id: string) => spent.has(id);

/** Marks a request as acted on; true if it had not been already. */
export const spend = (id: string) => {
  if (spent.has(id)) {
    return false;
  }

  spent.add(id);
  writeJson(session, SPENT_KEY, [...spent].slice(-SPENT_LIMIT));

  return true;
};
