import moment from 'moment';
import type {LOCATION_CHANGE} from 'connected-react-router';
import type {PkaEpisodeSearchResult, PkaEventSearchResult} from 'LibWasm';

export abstract class SearchResult<T = unknown> {
    protected res: T;

    constructor(res: T) {
        this.res = res;
    }

    abstract get timestamp(): number | null;
    abstract cardEpisodeNumber(): number;
    abstract cardTitle(): string;
    abstract cardSubtitle(): string;
    abstract cardDuration(): string;
    abstract cardTimestamp(): string | null;
}

export class EpisodeResult extends SearchResult<PkaEpisodeSearchResult> {
    get timestamp(): null {
        return null;
    }

    cardEpisodeNumber(): number {
        return this.res.episodeNumber;
    }

    cardTitle(): string {
        return this.res.title;
    }

    cardSubtitle(): string {
        return moment
            .utc(Number(this.res.uploadDate) * 1000)
            .format('dddd Do MMMM YYYY');
    }

    cardDuration(): string {
        const d = moment.utc(this.res.lengthSeconds * 1000);

        return `${d.hours()}h ${d.minutes()}m`;
    }

    cardTimestamp(): null {
        return null;
    }
}

export class EventResult extends SearchResult<PkaEventSearchResult> {
    get timestamp(): number {
        return this.res.timestamp;
    }

    cardEpisodeNumber(): number {
        return this.res.episodeNumber;
    }

    cardTitle(): string {
        return this.res.description;
    }

    cardSubtitle(): string {
        return moment
            .utc(Number(this.res.uploadDate) * 1000)
            .format('dddd Do MMMM YYYY');
    }

    cardDuration(): string {
        const d = moment.utc(this.res.lengthSeconds * 1000);

        if (d.hours() > 0) {
            return `${d.hours()}h ${d.minutes()}m ${d.seconds()}s`;
        }

        return `${d.minutes()}m ${d.seconds()}s`;
    }

    cardTimestamp(): string {
        return moment.utc(Number(this.res.timestamp) * 1000).format('HH:mm:ss');
    }
}

export interface SearchState {
    searchQuery: string;
    searchResults: SearchResult[];
    searchType?: SearchItemType;
    reverseResults?: boolean;
    isLoading?: boolean;
    errors: string[];
}

export interface SearchSuccessState {
    searchQuery: string;
    searchResults: SearchResult[];
}

export enum SearchItemType {
    EPISODE = 'Episode',
    EVENT = 'Event',
}

export enum SearchTypes {
    STARTED = 'SEARCH_STARTED',
    FAILURE = 'SEARCH_FAILURE',
    SUCCESS = 'SEARCH_SUCCESS',
    SET_SEARCH_TYPE = 'SEARCH_SET_SEARCH_TYPE',
    REVERSE_RESULTS_TOGGLE = 'SEARCH_REVERSE_RESULTS_TOGGLE',
}

interface SearchSuccess {
    type: SearchTypes.SUCCESS;
    payload: SearchSuccessState;
}

interface SearchFailure {
    type: SearchTypes.FAILURE;
    meta: {
        error: string;
    };
}

interface SearchStarted {
    type: SearchTypes.STARTED;
}

interface LocationChange {
    type: typeof LOCATION_CHANGE;
}

interface SetSearchType {
    type: SearchTypes.SET_SEARCH_TYPE;
    payload: SearchItemType;
}

interface ReverseResultsToggle {
    type: SearchTypes.REVERSE_RESULTS_TOGGLE;
}

type SearchActionTypes =
    | SearchStarted
    | SearchFailure
    | SearchSuccess
    | LocationChange
    | SetSearchType
    | ReverseResultsToggle;

export type SearchRootActionTypes = SearchActionTypes;
