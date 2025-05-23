import {
  type PkaEpisodeSearchResult,
  type PkaEventSearchResult,
  deserialize_episodes,
  deserialize_events,
} from '@/lib_wasm';
import ky from 'ky';

const client = ky.create({
  prefixUrl: '/v1/api',
});

type PkaEpisode = {
  number: number;
  name: string;
  youtubeLink: string;
  uploadDate: number;
};

type PkaYoutubeDetails = {
  videoId: string;
  episodeNumber: number;
  title: string;
  lengthSeconds: number;
};

export type PkaEvent = {
  eventId: string;
  episodeNumber: number;
  timestamp: number;
  description: string;
  lengthSeconds: number;
  uploadDate: number;
};

export type RandomPkaEvent = {
  episodeNumber: number;
  timestamp: number;
  description: string;
  lengthSeconds: number;
  uploadDate: number;
};

type PkaEpisodeWithAll = {
  episode: PkaEpisode;
  youtubeDetails: PkaYoutubeDetails;
  events: PkaEvent[];
};

export const fetchEpisodeById = async (episodeId: string) => {
  const response = await client.get(`episode/watch/${episodeId}`);

  const responsePayload = await response.json<{data: PkaEpisodeWithAll}>();

  return responsePayload.data;
};

export const fetchRandomEvent = async () => {
  const response = await client.get('events/random');

  const responsePayload = await response.json<{data: RandomPkaEvent}>();

  return responsePayload.data;
};

export const searchEpisodes = async (
  signal: AbortSignal,
  searchQuery: string,
): Promise<PkaEpisodeSearchResult[]> => {
  const response = await client.post('search/search_pka_episode', {
    signal,
    json: {
      query: searchQuery,
    },
  });

  const data = await response.arrayBuffer();

  const bytes = new Uint8Array(data);

  return await deserialize_episodes(bytes);
};

export const searchEvents = async (
  signal: AbortSignal,
  searchQuery: string,
): Promise<PkaEventSearchResult[]> => {
  const response = await client.post('search/search_pka_event', {
    signal,
    json: {
      query: searchQuery,
    },
  });

  const data = await response.arrayBuffer();

  const bytes = new Uint8Array(data);

  return await deserialize_events(bytes);
};
