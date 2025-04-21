import {keepPreviousData, queryOptions} from '@tanstack/react-query';
import {fetchEpisodeById, searchEpisodes} from './api';

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

export const searchEpisodeQueryOptions = (searchQuery = '') => {
  return queryOptions({
    queryKey: ['search', 'episode', searchQuery],
    queryFn: () => searchEpisodes(searchQuery),
    placeholderData: keepPreviousData,
  });
};
