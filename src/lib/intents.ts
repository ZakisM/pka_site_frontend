import { atom } from "jotai";

// "Open this episode with its moments filtered" — the search page's "N more
// Moments in this episode". State rather than a URL param for the same reason
// As startIntentAtom: the address bar is for sharing, not for driving the UI.
export const railFilterIntentAtom = atom<{
  episodeNumber: number;
  filter: string;
} | null>(null);
