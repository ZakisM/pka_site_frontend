import ky from "ky";

const client = ky.create({ prefix: "/api/v1" });

export interface PkaEpisode {
  number: number;
  name: string;
  youtubeLink: string;
  uploadDate: number;
}

export interface PkaYoutubeDetails {
  videoId: string;
  episodeNumber: number;
  title: string;
  lengthSeconds: number;
}

// Exactly what GET /episodes/:id returns per event — no id and no episode
// Number, so callers must supply the episode from their own context and key
// Rows by timestamp.
export interface PkaEvent {
  timestamp: number;
  description: string;
  lengthSeconds: number;
  uploadDate: number;
}

export interface PkaEpisodeWithAll {
  episode: PkaEpisode;
  youtubeDetails: PkaYoutubeDetails;
  events: PkaEvent[];
}

export interface RandomPkaEvent {
  episodeNumber: number;
  timestamp: number;
  description: string;
  lengthSeconds: number;
  uploadDate: number;
}

export const fetchEpisodeById = async (episodeId: string) => {
  const response = await client.get(`episodes/${episodeId}`);
  const payload = await response.json<{ data: PkaEpisodeWithAll }>();

  return payload.data;
};

export const fetchRandomEvent = async () => {
  const response = await client.get("events/random");
  const payload = await response.json<{ data: RandomPkaEvent }>();

  return payload.data;
};

// An episode as lists and search results show it.
export interface EpisodeSummary {
  episodeNumber: number;
  uploadDate: number;
  title: string;
  lengthSeconds: number;
  videoId: string;
  eventCount: number;
}

export interface SearchHit {
  timestamp: number;
  description: string;
  lengthSeconds: number;
}

// One episode in the results: its first few matching moments, in order, and
// How many matched altogether.
export interface SearchGroup {
  episode: EpisodeSummary;
  matchCount: number;
  hits: SearchHit[];
}

export interface SearchPage {
  totalMoments: number;
  totalEpisodes: number;
  groups: SearchGroup[];
  nextPage: number | null;
}

export type SearchSort = "newest" | "matches";

// A moment in another episode about the same thing, with the words they share.
export interface RelatedMoment {
  episode: EpisodeSummary;
  timestamp: number;
  description: string;
  lengthSeconds: number;
  sharedTerms: string[];
}

export const fetchRelated = async (signal: AbortSignal, episodeNumber: number, timestamp: number) => {
  const response = await client.get("events/related", {
    signal,
    searchParams: { episode: episodeNumber, timestamp },
  });
  const payload = await response.json<{ data: RelatedMoment[] }>();

  return payload.data;
};

// Every episode, newest first.
export const fetchEpisodes = async (signal: AbortSignal) => {
  const response = await client.get("episodes", { signal });
  const payload = await response.json<{ data: EpisodeSummary[] }>();

  return payload.data;
};

// Searching and grouping happen on the server, which returns one page of
// Episode groups at a time — the device only ever handles a page.
export const searchPage = async ({
  signal,
  query,
  sort,
  page,
}: {
  signal: AbortSignal;
  query: string;
  sort: SearchSort;
  page: number;
}) => {
  const response = await client.get("search", {
    signal,
    searchParams: { q: query, sort, page },
  });
  const payload = await response.json<{ data: SearchPage }>();

  return payload.data;
};
