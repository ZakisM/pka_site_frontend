import {
  type PkaEpisodeSearchResult,
  type PkaEventSearchResult,
  deserialize_episodes,
  deserialize_events,
} from "@/lib_wasm";
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

// Search responses are bincode, decoded by the wasm module: an unfiltered
// Query is ~35k moments and JSON parsing that is far slower.
const searchBytes = async (
  path: string,
  signal: AbortSignal,
  query: string,
) => {
  const response = await client.post(path, { signal, json: { query } });

  return new Uint8Array(await response.arrayBuffer());
};

export const searchEpisodes = async (
  signal: AbortSignal,
  query: string,
): Promise<PkaEpisodeSearchResult[]> =>
  deserialize_episodes(await searchBytes("search/episodes", signal, query));

export const searchEvents = async (
  signal: AbortSignal,
  query: string,
): Promise<PkaEventSearchResult[]> =>
  deserialize_events(await searchBytes("search/events", signal, query));
