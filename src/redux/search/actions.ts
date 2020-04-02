import axios from "axios";
import {Dispatch} from "redux";
import {SERVER_IP} from "../../App";
import {SearchEventActionTypes, SearchEventTypes, SearchState} from "./types";

export const searchPKAEvents = (searchQuery: string) => (dispatch: Dispatch<SearchEventActionTypes>) => {
    console.log(`Searching for PKA event: ${searchQuery}`);
    dispatch(searchEventStarted());

    axios
        .post(`http://${SERVER_IP}/v1/api/search_pka_event`, {query: searchQuery})
        .then(res => {

            let searchResult: SearchState = {
                searchQuery: searchQuery,
                searchResults: res.data.data,
            };

            return dispatch(searchEventSuccess(searchResult))
        })
        .catch(err => {
            if (err.message === "Network Error") {
                err = "Server appears to be offline.";
            } else if (err.response) {
                err = err.response.data.message;
            } else {
                err = err.message;
            }

            return dispatch(searchEventFailure(err.message))
        })
};

const searchEventStarted = (): SearchEventActionTypes => ({
    type: SearchEventTypes.STARTED,
});

const searchEventSuccess = (searchResult: SearchState): SearchEventActionTypes => ({
    type: SearchEventTypes.SUCCESS,
    payload: searchResult
});

const searchEventFailure = (err: string): SearchEventActionTypes => ({
    type: SearchEventTypes.FAILURE,
    meta: {
        error: err
    }
});

export const searchEventClearResults = (): SearchEventActionTypes => ({
    type: SearchEventTypes.CLEAR,
});
