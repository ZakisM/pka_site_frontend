import { searchReducer } from "./search/reducers";
import { Action, combineReducers } from "redux";
import { watchEpisodeReducer } from "./watch-episode/reducers";
import { connectRouter, RouterState } from "connected-react-router";
import { SearchState } from "./search/types";
import { WatchEpisodeState } from "./watch-episode/types";
import { PkaEventsState } from "./events/types";
import { pkaEventsReducer } from "./events/reducers";
import { ThunkDispatch } from "redux-thunk";
import { History } from "history";

export type ThunkDispatchType<T extends Action> = ThunkDispatch<any, any, T>;

export const rootReducer = (history: History): any =>
    combineReducers({
        router: connectRouter(history),
        search: searchReducer,
        watchEpisode: watchEpisodeReducer,
        pkaEvents: pkaEventsReducer,
    });

export interface RootState {
    router: RouterState;
    search: SearchState;
    watchEpisode: WatchEpisodeState;
    pkaEvents: PkaEventsState;
}
