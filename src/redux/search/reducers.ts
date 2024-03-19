import {
    SearchItemType,
    type SearchRootActionTypes,
    type SearchState,
    SearchTypes,
} from './types';
import {LOCATION_CHANGE} from 'connected-react-router';

const initialState: SearchState = {
    searchQuery: '',
    searchResults: [],
    reverseResults: false,
    isLoading: false,
    errors: [],
};

export function searchReducer(
    state = initialState,
    action: SearchRootActionTypes
): SearchState {
    switch (action.type) {
        case SearchTypes.STARTED: {
            return {
                ...state,
                isLoading: true,
            };
        }
        case SearchTypes.FAILURE: {
            return {
                ...state,
                isLoading: false,
                errors: [...state.errors, action.meta.error],
            };
        }
        case SearchTypes.SUCCESS: {
            return {
                ...state,
                isLoading: false,
                searchQuery: action.payload.searchQuery,
                searchResults: [...action.payload.searchResults],
            };
        }
        case LOCATION_CHANGE: {
            return {
                ...state,
                // Don't remember the search query for Episodes when switching between pages
                searchQuery:
                    state.searchType === SearchItemType.EPISODE
                        ? ''
                        : state.searchQuery,
                searchResults: [],
            };
        }
        case SearchTypes.SET_SEARCH_TYPE: {
            return {
                ...state,
                searchType: action.payload,
            };
        }
        case SearchTypes.REVERSE_RESULTS_TOGGLE: {
            return {
                ...state,
                searchResults: [...state.searchResults].reverse(),
                reverseResults: state.reverseResults !== true,
            };
        }
        default:
            return state;
    }
}
