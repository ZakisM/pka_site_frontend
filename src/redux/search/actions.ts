import axios from 'axios';
import type {Dispatch} from 'redux';
import {
    SearchItemType,
    type SearchRootActionTypes,
    type SearchSuccessState,
    SearchTypes,
    EpisodeResult,
    type SearchResult,
    EventResult,
} from './types';
import type {RootState} from '../index';
import handleError from '../../util';
import {
    deserialize_episodes,
    deserialize_events,
    type PkaEventSearchResult,
    type PkaEpisodeSearchResult,
} from 'LibWasm';

export const searchPKAItem =
    (searchQuery: string, searchItemType: SearchItemType) =>
    (
        dispatch: Dispatch<SearchRootActionTypes>,
        getState: () => RootState,
    ): void => {
        dispatch(searchEventStarted());
        dispatch(setSearchType(searchItemType));

        const getEndpoint = (): string => {
            switch (searchItemType) {
                case SearchItemType.EPISODE:
                    return 'search/search_pka_episode';
                case SearchItemType.EVENT:
                    return 'search/search_pka_event';
            }
        };

        if (searchItemType === SearchItemType.EVENT && searchQuery === '') {
            dispatch(
                searchEventSuccess({
                    searchQuery: searchQuery,
                    searchResults: [],
                }),
            );

            return;
        }

        const endpoint = getEndpoint();

        axios
            .post(
                `/v1/api/${endpoint}`,
                {query: searchQuery},
                {responseType: 'arraybuffer'},
            )
            .then(async (res) => {
                let searchResults: SearchResult[] = [];

                const bytes = new Uint8Array(res.data);

                switch (searchItemType) {
                    case SearchItemType.EPISODE: {
                        const results: PkaEpisodeSearchResult[] = JSON.parse(
                            new TextDecoder('utf-8').decode(
                                await deserialize_episodes(bytes),
                            ),
                        );

                        searchResults = results.map(
                            (r) => new EpisodeResult(r),
                        );

                        break;
                    }
                    case SearchItemType.EVENT: {
                        const results: PkaEventSearchResult[] = JSON.parse(
                            new TextDecoder('utf-8').decode(
                                await deserialize_events(bytes),
                            ),
                        );

                        searchResults = results.map((r) => new EventResult(r));

                        if (getState().search.reverseResults && searchResults) {
                            searchResults = searchResults.reverse();
                        }

                        break;
                    }
                }

                const searchResult: SearchSuccessState = {
                    searchQuery: searchQuery,
                    searchResults: searchResults,
                };

                return dispatch(searchEventSuccess(searchResult));
            })
            .catch((error) => {
                const handledError = handleError(error);

                return dispatch(searchEventFailure(handledError));
            });
    };

const searchEventStarted = (): SearchRootActionTypes => ({
    type: SearchTypes.STARTED,
});

const searchEventSuccess = (
    searchResult: SearchSuccessState,
): SearchRootActionTypes => ({
    type: SearchTypes.SUCCESS,
    payload: searchResult,
});

const searchEventFailure = (err: string): SearchRootActionTypes => ({
    type: SearchTypes.FAILURE,
    meta: {
        error: err,
    },
});

const setSearchType = (searchType: SearchItemType): SearchRootActionTypes => ({
    type: SearchTypes.SET_SEARCH_TYPE,
    payload: searchType,
});

export const reverseResultsToggle = (): SearchRootActionTypes => ({
    type: SearchTypes.REVERSE_RESULTS_TOGGLE,
});
