import axios from "axios";
import { Dispatch } from "redux";
import {
    EpisodeWithAllFieldsClass,
    EventWithAllFieldsClass,
    SearchItemType,
    SearchRootActionTypes,
    SearchSuccessState,
    SearchTypes,
} from "./types";
import { RootState } from "../index";
import * as flatbuffers from "flatbuffers";
import handleError from "../../util";
import { AllPkaEventSearchResultsFb } from "../../flatbuffers/all-pka-event-search-results-fb";

export const searchPKAItem =
    (searchQuery: string, searchItemType: SearchItemType) =>
    (dispatch: Dispatch<SearchRootActionTypes>, getState: () => RootState): void => {
        dispatch(searchEventStarted());
        dispatch(setSearchType(searchItemType));

        const getEndpoint = (): string => {
            switch (searchItemType) {
                case SearchItemType.EPISODE:
                    return "search/search_pka_episode";
                case SearchItemType.EVENT:
                    return "search/search_pka_event";
            }
        };

        const endpoint = getEndpoint();

        axios
            .post(
                `/v1/api/${endpoint}`,
                { query: searchQuery },
                searchItemType === SearchItemType.EVENT ? { responseType: "arraybuffer" } : {}
            )
            .then((res) => {
                let searchResults = [];

                switch (searchItemType) {
                    case SearchItemType.EPISODE: {
                        for (const sr of res.data.data) {
                            searchResults.push(EpisodeWithAllFieldsClass.Deserialize(sr));
                        }
                        break;
                    }
                    case SearchItemType.EVENT: {
                        const data = new Uint8Array(res.data);

                        const buf = new flatbuffers.ByteBuffer(data);

                        const all_events = AllPkaEventSearchResultsFb.getRootAsAllPkaEventSearchResultsFb(buf);

                        for (let i = 0; i < all_events.resultsLength(); i++) {
                            const event = all_events.results(i);
                            if (event != null) {
                                searchResults.push(EventWithAllFieldsClass.Deserialize(event));
                            }
                        }

                        if (getState().search.reverseResults && searchResults) {
                            searchResults = [...searchResults].reverse();
                        }
                        break;
                    }
                }

                const searchResult: SearchSuccessState = {
                    searchQuery: searchQuery,
                    searchResults: searchResults,
                };

                return dispatch(searchEventSuccess(searchResult));
            })
            .catch((err) => {
                err = handleError(err);

                return dispatch(searchEventFailure(err));
            });
    };

const searchEventStarted = (): SearchRootActionTypes => ({
    type: SearchTypes.STARTED,
});

const searchEventSuccess = (searchResult: SearchSuccessState): SearchRootActionTypes => ({
    type: SearchTypes.SUCCESS,
    payload: searchResult,
});

const searchEventFailure = (err: string): SearchRootActionTypes => ({
    type: SearchTypes.FAILURE,
    meta: {
        error: err,
    },
});

const setSearchType = (searchType: SearchItemType): SearchRootActionTypes => ({
    type: SearchTypes.SET_SEARCH_TYPE,
    payload: searchType,
});

export const reverseResultsToggle = (): SearchRootActionTypes => ({
    type: SearchTypes.REVERSE_RESULTS_TOGGLE,
});
