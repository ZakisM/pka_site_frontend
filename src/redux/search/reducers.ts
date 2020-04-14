import {SearchEventActionTypes, SearchEventTypes, SearchState} from "./types";
import {LOCATION_CHANGE} from "connected-react-router";

const initialState: SearchState = {
    searchQuery: "",
    searchResults: [],
    reverseResults: false,
    isLoading: false,
    errors: []
};

export function searchReducer(
    state = initialState,
    action: SearchEventActionTypes
): SearchState {
    switch (action.type) {
        case SearchEventTypes.STARTED: {
            return {
                ...state,
                isLoading: true,
            };
        }
        case SearchEventTypes.FAILURE: {
            return {
                ...state,
                isLoading: false,
                errors: [...state.errors!, action.meta.error],
            };
        }
        case SearchEventTypes.SUCCESS: {
            return {
                ...state,
                isLoading: false,
                ...action.payload,
            };
        }
        case SearchEventTypes.CLEAR: {
            return {
                ...state,
                searchResults: [],
            };
        }
        case LOCATION_CHANGE: {
            return {
                ...state,
                searchQuery: "",
                searchResults: []
            }
        }
        case SearchEventTypes.SET_SEARCH_TYPE: {
            return {
                ...state,
                searchType: action.payload
            }
        }
        case SearchEventTypes.REVERSE_RESULTS_TOGGLE: {
            return {
                ...state,
                reverseResults: state.reverseResults !== true,
            }
        }
        default:
            return state
    }
}