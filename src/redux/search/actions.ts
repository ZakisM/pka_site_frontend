import axios from "axios";
import {Dispatch} from "redux";
import {
    EventSearchResult,
    PkaSearchResult,
    SearchEventActionTypes,
    SearchEventTypes,
    SearchItemType,
    SearchState
} from "./types";
import {RootState} from "../index";
import {AllPkaEventSearchResultsFb} from "../../flatbuffers/pka_event_search_results_generated";
import {flatbuffers} from "flatbuffers";

export const searchPKAItem = (searchQuery: string, searchItemType: SearchItemType) => (dispatch: Dispatch<SearchEventActionTypes>, getState: () => RootState) => {
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
        .post(`/v1/api/${endpoint}`, {query: searchQuery}, searchItemType === SearchItemType.EVENT ? {responseType: "arraybuffer"} : {})
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
                    let data = new Uint8Array(res.data);

                    let buf = new flatbuffers.ByteBuffer(data);

                    let all_events = AllPkaEventSearchResultsFb.getRootAsAllPkaEventSearchResultsFb(buf);

                    for (let i = 0; i < all_events.resultsLength(); i++) {
                        let event = all_events.results(i);
                        searchResults.push(EventSearchResult.Deserialize(event));
                    }

                    if (getState().search.reverseResults && searchResults) {
                        searchResults = [...searchResults].reverse();
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
                err = "Server appears to be offline. Please refresh in a few minutes.";
            } else {
                err = err.message;
            }

            return dispatch(searchEventFailure(err))
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

export const reverseResultsToggle = (): SearchEventActionTypes => ({
    type: SearchEventTypes.REVERSE_RESULTS_TOGGLE,
});
