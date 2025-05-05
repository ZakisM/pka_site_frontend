import {fetchEpisodeById, searchEpisodes, searchEvents} from './api';
import {keepPreviousData, queryOptions} from '@tanstack/react-query';
import {SearchTab} from '@/atoms/searchAtoms';

export const episodeQueryKeyFn = (episodeId: string) => ['episode', episodeId];

export const episodeQueryOptions = (episodeId: string) => {
  return queryOptions({
    queryKey: episodeQueryKeyFn(episodeId),
    queryFn: () => fetchEpisodeById(episodeId),
  });
};

export const searchEpisodeQueryOptions = (searchQuery = '') => {
  return queryOptions({
    queryKey: ['search', SearchTab.EPISODES, searchQuery],
    queryFn: ({signal}) => searchEpisodes(signal, searchQuery),
    placeholderData: keepPreviousData,
  });
};

export const searchEventQueryOptions = (searchQuery = '') => {
  return queryOptions({
    queryKey: ['search', SearchTab.EVENTS, searchQuery],
    queryFn: ({signal}) => searchEvents(signal, searchQuery),
    placeholderData: keepPreviousData,
  });
};
