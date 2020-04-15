export interface WatchEpisodeState {
    episode?: Episode,
    youtubeDetails?: YoutubeDetails;
    events?: Event[],
    timestamp: number,
    currentEventCard?: number,
    isLoading?: boolean,
    errors?: string[],
    numberOfRetries: number,
}

export interface Episode {
    number: number,
    name: string,
    uploadDate: number,
}

export interface YoutubeDetails {
    videoId: string,
    title: string,
    lengthSeconds: number,
    averageRating: number,
}

export interface Event {
    timestamp: number,
    description: string,
}

export enum WatchEpisodeTypes {
    STARTED = 'PLAYER_STARTED',
    FAILURE = 'PLAYER_FAILURE',
    SUCCESS = 'PLAYER_SUCCESS',
    PLAYER_INCREMENT_REQ_RETRY = 'PLAYER_INCREMENT_REQ_RETRY',
    SAVE_TIMESTAMP = 'PLAYER_SAVE_TIMESTAMP',
    SET_EVENT_CARD = 'PLAYER_SET_EVENT_CARD',
}

interface WatchEpisodeSuccess {
    type: WatchEpisodeTypes.SUCCESS,
    payload: WatchEpisodeState
}

interface WatchEpisodeFailure {
    type: WatchEpisodeTypes.FAILURE
    meta: {
        error: string
    }
}

interface WatchEpisodeStarted {
    type: WatchEpisodeTypes.STARTED
}

interface WatchEpisodeSaveTimestamp {
    type: WatchEpisodeTypes.SAVE_TIMESTAMP,
    payload: number
}

interface WatchEpisodeSetEventCard {
    type: WatchEpisodeTypes.SET_EVENT_CARD,
    payload: number
}

interface WatchEpisodeIncrementRetry {
    type: WatchEpisodeTypes.PLAYER_INCREMENT_REQ_RETRY
}

type WatchEpisodeActionTypes =
    WatchEpisodeStarted
    | WatchEpisodeFailure
    | WatchEpisodeSuccess
    | WatchEpisodeSaveTimestamp
    | WatchEpisodeSetEventCard
    | WatchEpisodeIncrementRetry

export type WatchEpisodeRootActionTypes = WatchEpisodeActionTypes
