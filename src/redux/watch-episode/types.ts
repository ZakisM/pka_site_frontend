export interface WatchEpisodeState {
    episode?: Episode,
    youtubeDetails?: YoutubeDetails;
    events?: Event[],
    timestamp: number,
    currentEventCard?: number,
    isLoading?: boolean
    errors?: string[]
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

type WatchEpisodeActionTypes =
    WatchEpisodeStarted
    | WatchEpisodeFailure
    | WatchEpisodeSuccess
    | WatchEpisodeSaveTimestamp
    | WatchEpisodeSetEventCard

export type WatchEpisodeRootActionTypes = WatchEpisodeActionTypes
