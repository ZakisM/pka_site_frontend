import moment from "moment";
import { LOCATION_CHANGE } from "connected-react-router";
import { PkaEventSearchResultFb } from "../../flatbuffers/pka-event-search-result-fb";

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
    EPISODE = "Episode",
    EVENT = "Event",
}

export interface SearchResult {
    episodeNumber: number;
    timestamp: number;

    cardTitle(): string;

    cardSubtitle(): string;

    cardDuration(): string;

    cardTimestamp(): string | undefined;
}

export interface EventWithAllFields extends SearchResult {
    episodeNumber: number;
    timestamp: number;
    description: string;
    lengthSeconds: number;
    uploadDate: number;
}

export class EventWithAllFieldsClass implements EventWithAllFields {
    episodeNumber: number;
    timestamp: number;
    description: string;
    lengthSeconds: number;
    uploadDate: number;

    constructor(
        episodeNumber: number,
        timestamp: number,
        description: string,
        lengthSeconds: number,
        uploadDate: number
    ) {
        this.episodeNumber = episodeNumber;
        this.timestamp = timestamp;
        this.description = description;
        this.lengthSeconds = lengthSeconds;
        this.uploadDate = uploadDate;
    }

    static Deserialize(input: PkaEventSearchResultFb): EventWithAllFieldsClass {
        const description = input.description() ? input.description()! : "";

        return new EventWithAllFieldsClass(
            input.episodeNumber(),
            input.timestamp(),
            description,
            input.lengthSeconds(),
            input.uploadDate().low
        );
    }

    static DeserializeNormalArr(input: EventWithAllFields[]): EventWithAllFieldsClass[] {
        return input.map(
            (event) =>
                new EventWithAllFieldsClass(
                    event.episodeNumber,
                    event.timestamp,
                    event.description,
                    event.lengthSeconds,
                    event.uploadDate
                )
        );
    }

    cardTitle(): string {
        return this.description;
    }

    cardSubtitle(): string {
        return moment.utc(Number(this.uploadDate) * 1000).format("dddd Do MMMM YYYY");
    }

    cardDuration(): string {
        const d = moment.utc(this.lengthSeconds * 1000);

        if (d.hours() > 0) {
            return `${d.hours()}h ${d.minutes()}m ${d.seconds()}s`;
        } else {
            return `${d.minutes()}m ${d.seconds()}s`;
        }
    }

    cardTimestamp(): string {
        return moment.utc(Number(this.timestamp) * 1000).format("HH:mm:ss");
    }
}

export interface EpisodeWithAllFields extends SearchResult {
    episodeNumber: number;
    uploadDate: number;
    title: string;
    lengthSeconds: number;
}

export class EpisodeWithAllFieldsClass implements EpisodeWithAllFields {
    episodeNumber: number;
    uploadDate: number;
    title: string;
    lengthSeconds: number;

    timestamp = 0;

    constructor(episodeNumber: number, uploadDate: number, title: string, lengthSeconds: number) {
        this.episodeNumber = episodeNumber;
        this.uploadDate = uploadDate;
        this.title = title;
        this.lengthSeconds = lengthSeconds;
    }

    static Deserialize(input: EpisodeWithAllFields): EpisodeWithAllFieldsClass {
        return new EpisodeWithAllFieldsClass(input.episodeNumber, input.uploadDate, input.title, input.lengthSeconds);
    }

    cardTitle(): string {
        return this.title;
    }

    cardSubtitle(): string {
        return moment.utc(Number(this.uploadDate) * 1000).format("dddd Do MMMM YYYY");
    }

    cardDuration(): string {
        const d = moment.utc(this.lengthSeconds * 1000);

        return `${d.hours()}h ${d.minutes()}m`;
    }

    cardTimestamp(): undefined {
        return undefined;
    }
}

export enum SearchTypes {
    STARTED = "SEARCH_STARTED",
    FAILURE = "SEARCH_FAILURE",
    SUCCESS = "SEARCH_SUCCESS",
    SET_SEARCH_TYPE = "SEARCH_SET_SEARCH_TYPE",
    REVERSE_RESULTS_TOGGLE = "SEARCH_REVERSE_RESULTS_TOGGLE",
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
