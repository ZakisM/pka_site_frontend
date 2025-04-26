/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import ky from 'ky';
import {deserialize_episodes, type PkaEpisodeSearchResult} from '@/lib_wasm';

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

type PkaEpisodeWithAll = {
  episode: PkaEpisode;
  youtubeDetails: PkaYoutubeDetails;
  events: PkaEvent[];
};

export const fetchEpisodeById = async (
  episodeId: string,
): Promise<PkaEpisodeWithAll> => {
  const response = await client.get(`episode/watch/${episodeId}`);

  const {data} = await response.json<any>();

  return data;
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
