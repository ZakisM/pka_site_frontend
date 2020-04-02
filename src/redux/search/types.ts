export interface SearchState {
    searchQuery: string
    searchResults: EventSearchResult[]
    isLoading?: boolean
    errors?: string[]
}

export interface EventSearchResult {
    episodeNumber: number,
    timestamp: number,
    description: string,
}

export enum SearchEventTypes {
    STARTED = 'SEARCH_EVENT_STARTED',
    FAILURE = 'SEARCH_EVENT_FAILURE',
    SUCCESS = 'SEARCH_EVENT_SUCCESS',
    CLEAR = 'SEARCH_EVENT_CLEAR',
}

interface SearchEventSuccess {
    type: SearchEventTypes.SUCCESS,
    payload: SearchState
}

interface SearchEventFailure {
    type: SearchEventTypes.FAILURE
    meta: {
        error: string
    }
}

interface SearchEventStarted {
    type: SearchEventTypes.STARTED
}

interface SearchEventClearResults {
    type: SearchEventTypes.CLEAR
}

type SearchActionTypes = SearchEventStarted | SearchEventFailure | SearchEventSuccess | SearchEventClearResults

export type SearchEventActionTypes = SearchActionTypes
