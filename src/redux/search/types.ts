import moment from "moment";
import {LOCATION_CHANGE} from "connected-react-router";

export interface SearchState {
    searchQuery: string
    searchResults: SearchResult[]
    searchType?: SearchItemType,
    isLoading?: boolean
    errors?: string[]
}

export enum SearchItemType {
    EPISODE = 'Episode',
    EVENT = 'Event',
}

export interface SearchResult {
    episodeNumber: number,
    timestamp: number,

    cardTitle(): string,

    cardSubtitle(): string,
}

export interface EventSearchResultFields extends SearchResult {
    episodeNumber: number,
    timestamp: number,
    description: string,
}

export class EventSearchResult implements EventSearchResultFields {
    episodeNumber: number;
    timestamp: number;
    description: string;

    constructor(episodeNumber: number, timestamp: number, description: string) {
        this.episodeNumber = episodeNumber;
        this.timestamp = timestamp;
        this.description = description;
    }

    static Deserialize(input: any): EventSearchResult {
        return new EventSearchResult(input.episodeNumber, input.timestamp, input.description)
    }

    cardTitle(): string {
        return this.description;
    }

    cardSubtitle(): string {
        return `Starts at ${moment.utc(Number(this.timestamp) * 1000).format("HH:mm:ss")}`;
    }
}

export interface PkaSearchResultFields extends SearchResult {
    episodeNumber: number,
    uploadDate: number,
    title: string,
}

export class PkaSearchResult implements PkaSearchResultFields {
    episodeNumber: number;
    uploadDate: number;
    title: string;

    timestamp = 0;

    constructor(episodeNumber: number, uploadDate: number, title: string) {
        this.episodeNumber = episodeNumber;
        this.uploadDate = uploadDate;
        this.title = title;
    }

    static Deserialize(input: PkaSearchResultFields): PkaSearchResult {
        return new PkaSearchResult(input.episodeNumber, input.uploadDate, input.title)
    }

    cardTitle(): string {
        return this.title;
    }

    cardSubtitle(): string {
        return moment.utc(Number(this.uploadDate) * 1000).format("dddd Do MMMM YYYY");
    }

}

export enum SearchEventTypes {
    STARTED = 'SEARCH_EVENT_STARTED',
    FAILURE = 'SEARCH_EVENT_FAILURE',
    SUCCESS = 'SEARCH_EVENT_SUCCESS',
    CLEAR = 'SEARCH_EVENT_CLEAR',
    SET_SEARCH_TYPE = 'SET_SEARCH_TYPE',
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

interface LocationChange {
    type: typeof LOCATION_CHANGE
}

interface SetSearchType {
    type: SearchEventTypes.SET_SEARCH_TYPE,
    payload: SearchItemType
}

type SearchActionTypes =
    SearchEventStarted
    | SearchEventFailure
    | SearchEventSuccess
    | SearchEventClearResults
    | LocationChange
    | SetSearchType

export type SearchEventActionTypes = SearchActionTypes
