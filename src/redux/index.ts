import {searchReducer} from "./search/reducers";
import {combineReducers} from "redux";
import {watchEpisodeReducer} from "./watch-episode/reducers";
import {connectRouter, RouterState} from 'connected-react-router'
import {SearchState} from "./search/types";
import {WatchEpisodeState} from "./watch-episode/types";

export const rootReducer = (history: any) => combineReducers({
    router: connectRouter(history),
    search: searchReducer,
    watchEpisode: watchEpisodeReducer,
});

export interface RootState {
    router: RouterState,
    search: SearchState,
    watchEpisode: WatchEpisodeState,
}
