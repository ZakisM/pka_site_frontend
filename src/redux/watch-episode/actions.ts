import axios from 'axios';
import type {Dispatch} from 'redux';
import {
    type WatchEpisodeRootActionTypes,
    type WatchEpisodeSuccessState,
    WatchEpisodeTypes,
} from './types';
import handleError from '../../util';

export const watchPKAEpisode =
    (episodeNumber: number | 'latest' | 'random', timestamp: number) =>
    (dispatch: Dispatch<WatchEpisodeRootActionTypes>): void => {
        dispatch(watchEpisodeStarted());

        axios
            .get(`/v1/api/episode/watch/${episodeNumber}`)
            .then((res) => {
                const watchEpisodeResult: WatchEpisodeSuccessState = {
                    episode: res.data.data.episode,
                    youtubeDetails: res.data.data.youtubeDetails,
                    events: res.data.data.events,
                    timestamp: timestamp,
                };

                return dispatch(watchEpisodeSuccess(watchEpisodeResult));
            })
            .catch((error) => {
                const handledError = handleError(error);

                return dispatch(watchEpisodeFailure(handledError));
            });
    };

export const getPKAEpisodeYoutubeLink = (
    episodeNumber: number,
): Promise<string | null> => {
    return axios
        .get(`/v1/api/episode/youtube_link/${episodeNumber}`)
        .then((res) => {
            return res.data.data;
        })
        .catch((error) => {
            const handledError = handleError(error);

            console.log(handledError);

            return null;
        });
};

export const saveTimestamp = (
    timestamp: number,
): WatchEpisodeRootActionTypes => ({
    type: WatchEpisodeTypes.SAVE_TIMESTAMP,
    payload: timestamp,
});

export const setCurrentEventCard = (
    id: number,
): WatchEpisodeRootActionTypes => ({
    type: WatchEpisodeTypes.SET_EVENT_CARD,
    payload: id,
});

export const clearWatchState = (): WatchEpisodeRootActionTypes => ({
    type: WatchEpisodeTypes.CLEAR_WATCH_STATE,
});

const watchEpisodeStarted = (): WatchEpisodeRootActionTypes => ({
    type: WatchEpisodeTypes.STARTED,
});

const watchEpisodeSuccess = (
    watchState: WatchEpisodeSuccessState,
): WatchEpisodeRootActionTypes => ({
    type: WatchEpisodeTypes.SUCCESS,
    payload: watchState,
});

const watchEpisodeFailure = (err: string): WatchEpisodeRootActionTypes => ({
    type: WatchEpisodeTypes.FAILURE,
    meta: {
        error: err,
    },
});
