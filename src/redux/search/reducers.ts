import {SearchEventActionTypes, SearchEventTypes, SearchState} from "./types";
import {LOCATION_CHANGE} from "connected-react-router";

const initialState: SearchState = {
    searchQuery: "",
    searchResults: [],
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
                isLoading: false,
                searchResults: [],
            };
        }
        case LOCATION_CHANGE: {
            return {
                ...state,
                isLoading: false,
                searchQuery: "",
                searchResults: []
            }
        }
        default:
            return state
    }
}