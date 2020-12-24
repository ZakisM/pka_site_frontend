import axios from "axios";
import {Dispatch} from "redux";
import {
    EpisodeWithAllFieldsClass,
    EventWithAllFieldsClass,
    SearchItemType,
    SearchRootActionTypes,
    SearchState,
    SearchTypes
} from "./types";
import {RootState} from "../index";
import {AllPkaEventSearchResultsFb} from "../../flatbuffers/pka_event_search_results_generated";
import {flatbuffers} from "flatbuffers";
import handleError from "../../util";

export const searchPKAItem = (searchQuery: string, searchItemType: SearchItemType) => (dispatch: Dispatch<SearchRootActionTypes>, getState: () => RootState) => {
    dispatch(searchEventStarted());
    dispatch(setSearchType(searchItemType));

    const getEndpoint = () => {
        switch (searchItemType) {
            case SearchItemType.EPISODE:
                return 'search/search_pka_episode';
            case SearchItemType.EVENT:
                return 'search/search_pka_event';
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
                        searchResults.push(EpisodeWithAllFieldsClass.Deserialize(sr))
                    }
                    break;
                }
                case SearchItemType.EVENT: {
                    let data = new Uint8Array(res.data);

                    let buf = new flatbuffers.ByteBuffer(data);

                    let all_events = AllPkaEventSearchResultsFb.getRootAsAllPkaEventSearchResultsFb(buf);

                    for (let i = 0; i < all_events.resultsLength(); i++) {
                        let event = all_events.results(i);
                        searchResults.push(EventWithAllFieldsClass.Deserialize(event));
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
            err = handleError(err);

            return dispatch(searchEventFailure(err))
        })
};

const searchEventStarted = (): SearchRootActionTypes => ({
    type: SearchTypes.STARTED,
});

const searchEventSuccess = (searchResult: SearchState): SearchRootActionTypes => ({
    type: SearchTypes.SUCCESS,
    payload: searchResult
});

const searchEventFailure = (err: string): SearchRootActionTypes => ({
    type: SearchTypes.FAILURE,
    meta: {
        error: err
    }
});

const setSearchType = (searchType: SearchItemType): SearchRootActionTypes => ({
    type: SearchTypes.SET_SEARCH_TYPE,
    payload: searchType
});


export const reverseResultsToggle = (): SearchRootActionTypes => ({
    type: SearchTypes.REVERSE_RESULTS_TOGGLE,
});
