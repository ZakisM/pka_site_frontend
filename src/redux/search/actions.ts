import axios from "axios";
import {Dispatch} from "redux";
import {SERVER_IP} from "../../App";
import {
    EventSearchResult,
    PkaSearchResult,
    SearchEventActionTypes,
    SearchEventTypes,
    SearchItemType,
    SearchState
} from "./types";

export const searchPKAItem = (searchQuery: string, searchItemType: SearchItemType) => (dispatch: Dispatch<SearchEventActionTypes>) => {
    dispatch(searchEventStarted());
    dispatch(setSearchType(searchItemType));

    const getEndpoint = () => {
        switch (searchItemType) {
            case SearchItemType.EPISODE:
                return 'search_pka_episode';
            case SearchItemType.EVENT:
                return 'search_pka_event';
        }
    };

    let endpoint = getEndpoint();

    axios
        .post(`http://${SERVER_IP}/v1/api/${endpoint}`, {query: searchQuery})
        .then(res => {

            let searchResults = [];

            switch (searchItemType) {
                case SearchItemType.EPISODE: {
                    for (let sr of res.data.data) {
                        searchResults.push(PkaSearchResult.Deserialize(sr))
                    }
                    break;
                }
                case SearchItemType.EVENT: {
                    for (let sr of res.data.data) {
                        searchResults.push(EventSearchResult.Deserialize(sr))
                    }
                    break;
                }
            }

            let searchResult: SearchState = {
                searchQuery: searchQuery,
                searchResults: searchResults,
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

const setSearchType = (searchType: SearchItemType): SearchEventActionTypes => ({
    type: SearchEventTypes.SET_SEARCH_TYPE,
    payload: searchType
});

export const searchEventClearResults = (): SearchEventActionTypes => ({
    type: SearchEventTypes.CLEAR,
});
