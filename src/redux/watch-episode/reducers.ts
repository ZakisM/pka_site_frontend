import {
    type WatchEpisodeRootActionTypes,
    type WatchEpisodeState,
    WatchEpisodeTypes,
} from './types';

const initialState: WatchEpisodeState = {
    episode: undefined,
    events: undefined,
    youtubeDetails: undefined,
    timestamp: 0,
    currentEventCard: 0,
    isLoading: false,
    errors: [],
};

export function watchEpisodeReducer(
    state = initialState,
    action: WatchEpisodeRootActionTypes
): WatchEpisodeState {
    switch (action.type) {
        case WatchEpisodeTypes.STARTED: {
            return {
                ...state,
                isLoading: true,
            };
        }
        case WatchEpisodeTypes.FAILURE: {
            return {
                ...state,
                isLoading: false,
                errors: [...state.errors, action.meta.error],
            };
        }
        case WatchEpisodeTypes.SUCCESS: {
            return {
                ...state,
                isLoading: false,
                ...action.payload,
            };
        }
        case WatchEpisodeTypes.SAVE_TIMESTAMP: {
            return {
                ...state,
                timestamp: action.payload,
            };
        }
        case WatchEpisodeTypes.SET_EVENT_CARD: {
            return {
                ...state,
                currentEventCard: action.payload,
            };
        }
        case WatchEpisodeTypes.CLEAR_WATCH_STATE: {
            return {
                ...initialState,
            };
        }
        default:
            return state;
    }
}
