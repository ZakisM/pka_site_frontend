export interface WatchEpisodeState {
    episode?: Episode;
    youtubeDetails?: YoutubeDetails;
    events?: WatchEpisodeEvent[];
    timestamp: number;
    currentEventCard?: number;
    isLoading?: boolean;
    errors: string[];
}

export interface Episode {
    number: number;
    name: string;
    uploadDate: number;
    lengthSeconds: number;
}

export interface YoutubeDetails {
    videoId: string;
    title: string;
    lengthSeconds: number;
    averageRating: number;
}

export interface WatchEpisodeEvent {
    timestamp: number;
    description: string;
    lengthSeconds: number;
}

export interface WatchEpisodeSuccessState {
    episode?: Episode;
    youtubeDetails?: YoutubeDetails;
    events?: WatchEpisodeEvent[];
    timestamp: number;
}

export enum WatchEpisodeTypes {
    STARTED = 'WATCH_EPISODE_EVENT_STARTED',
    FAILURE = 'WATCH_EPISODE_EVENT_FAILURE',
    SUCCESS = 'WATCH_EPISODE_EVENT_SUCCESS',
    SAVE_TIMESTAMP = 'WATCH_EPISODE_EVENT_SAVE_TIMESTAMP',
    SET_EVENT_CARD = 'WATCH_EPISODE_EVENT_SET_EVENT_CARD',
    CLEAR_WATCH_STATE = 'WATCH_EPISODE_EVENT_CLEAR_WATCH_STATE',
}

interface WatchEpisodeSuccess {
    type: WatchEpisodeTypes.SUCCESS;
    payload: WatchEpisodeSuccessState;
}

interface WatchEpisodeFailure {
    type: WatchEpisodeTypes.FAILURE;
    meta: {
        error: string;
    };
}

interface WatchEpisodeStarted {
    type: WatchEpisodeTypes.STARTED;
}

interface WatchEpisodeSaveTimestamp {
    type: WatchEpisodeTypes.SAVE_TIMESTAMP;
    payload: number;
}

interface WatchEpisodeSetEventCard {
    type: WatchEpisodeTypes.SET_EVENT_CARD;
    payload: number;
}

interface WatchEpisodeClearWatchState {
    type: WatchEpisodeTypes.CLEAR_WATCH_STATE;
}

type WatchEpisodeActionTypes =
    | WatchEpisodeStarted
    | WatchEpisodeFailure
    | WatchEpisodeSuccess
    | WatchEpisodeSaveTimestamp
    | WatchEpisodeSetEventCard
    | WatchEpisodeClearWatchState;

export type WatchEpisodeRootActionTypes = WatchEpisodeActionTypes;
