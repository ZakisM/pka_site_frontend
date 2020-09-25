import {searchReducer} from "./search/reducers";
import {combineReducers} from "redux";
import {watchEpisodeReducer} from "./watch-episode/reducers";
import {connectRouter, RouterState} from 'connected-react-router'
import {SearchState} from "./search/types";
import {WatchEpisodeState} from "./watch-episode/types";
import {PkaEventsState} from "./events/types";
import {pkaEventsReducer} from "./events/reducers";

export const rootReducer = (history: any) => combineReducers({
    router: connectRouter(history),
    search: searchReducer,
    watchEpisode: watchEpisodeReducer,
    pkaEvents: pkaEventsReducer,
});

export interface RootState {
    router: RouterState,
    search: SearchState,
    watchEpisode: WatchEpisodeState,
    pkaEvents: PkaEventsState,
}
