import {searchReducer} from "./search/reducers";
import {combineReducers} from "redux";
import {watchEpisodeReducer} from "./watch-episode/reducers";

export const rootReducer = combineReducers({
    search: searchReducer,
    watchEpisode: watchEpisodeReducer,
});

export type RootState = ReturnType<typeof rootReducer>