/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */

import ky from 'ky';
import {deserialize_episodes, type PkaEpisodeSearchResult} from '@/lib_wasm';

const client = ky.create({
  prefixUrl: '/v1/api',
});

export const fetchEpisodeById = async (episodeId: string) => {
  const response = await client.get(`episode/watch/${episodeId}`);

  const {data} = await response.json<any>();

  return data;
};

export const searchEpisodes = async (
  searchQuery: string,
): Promise<PkaEpisodeSearchResult[]> => {
  const response = await client.post('search/search_pka_episode', {
    json: {
      query: searchQuery,
    },
  });

  const data = await response.arrayBuffer();

  const bytes = new Uint8Array(data);

  return await deserialize_episodes(bytes);
};
