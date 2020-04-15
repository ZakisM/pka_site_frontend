import axios from "axios";
import {Dispatch} from "redux";
import {WatchEpisodeRootActionTypes, WatchEpisodeState, WatchEpisodeTypes} from "./types";

export const watchPKAEpisode = (episodeNumber: number | "latest", timestamp: number) => (dispatch: Dispatch<WatchEpisodeRootActionTypes>) => {
    dispatch(watchEpisodeStarted());

    axios
        .get(`http://0.0.0.0:1234/v1/api/pka_episode/watch/${episodeNumber}`)
        .then(res => {

            let watchEpisodeResult: WatchEpisodeState = {
                episode: res.data.data.episode,
                youtubeDetails: res.data.data.youtubeDetails,
                events: res.data.data.events,
                timestamp: timestamp,
                numberOfRetries: 0,
            };

            return dispatch(watchEpisodeSuccess(watchEpisodeResult))
        })
        .catch(err => {
            if (err.message === "Network Error") {
                err = "Server appears to be offline. Please refresh in a few minutes.";
            } else if (err.response && err.response.data.message) {
                err = err.response.data.message;
            } else {
                err = err.message;
            }

            dispatch(watchEpisodeIncrementRetry())

            return dispatch(watchEpisodeFailure(err))
        })
};

export const saveTimestamp = (timestamp: number): WatchEpisodeRootActionTypes => ({
    type: WatchEpisodeTypes.SAVE_TIMESTAMP,
    payload: timestamp,
});

export const setCurrentEventCard = (id: number): WatchEpisodeRootActionTypes => ({
    type: WatchEpisodeTypes.SET_EVENT_CARD,
    payload: id,
});

const watchEpisodeStarted = (): WatchEpisodeRootActionTypes => ({
    type: WatchEpisodeTypes.STARTED,
});

const watchEpisodeSuccess = (watchState: WatchEpisodeState): WatchEpisodeRootActionTypes => ({
    type: WatchEpisodeTypes.SUCCESS,
    payload: watchState
});

const watchEpisodeFailure = (err: string): WatchEpisodeRootActionTypes => ({
    type: WatchEpisodeTypes.FAILURE,
    meta: {
        error: err
    }
});

const watchEpisodeIncrementRetry = (): WatchEpisodeRootActionTypes => ({
    type: WatchEpisodeTypes.PLAYER_INCREMENT_REQ_RETRY,
});

