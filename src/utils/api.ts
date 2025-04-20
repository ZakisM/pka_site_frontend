/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import ky from 'ky';

const client = ky.create({
  prefixUrl: '/v1/api/episode',
});

export const fetchEpisodeById = async (episodeId: string) => {
  const response = await client.get(`watch/${episodeId}`);

  const {data} = await response.json<any>();

  return data;
};
