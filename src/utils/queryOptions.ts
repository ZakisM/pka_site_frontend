import {queryOptions} from '@tanstack/react-query';
import {fetchEpisodeById} from './api';

export const episodeQueryKeyFn = (episodeId: string | number) => [
  'episode',
  episodeId.toString(),
];

export const episodeQueryOptions = (episodeId: string) => {
  return queryOptions({
    queryKey: episodeQueryKeyFn(episodeId),
    queryFn: () => fetchEpisodeById(episodeId),
  });
};
