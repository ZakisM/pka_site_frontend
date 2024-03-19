import {searchReducer} from './search/reducers';
import {type Action, combineReducers} from 'redux';
import {watchEpisodeReducer} from './watch-episode/reducers';
import {connectRouter, type RouterState} from 'connected-react-router';
import type {SearchState} from './search/types';
import type {WatchEpisodeState} from './watch-episode/types';
import type {PkaEventsState} from './events/types';
import {pkaEventsReducer} from './events/reducers';
import type {ThunkDispatch} from 'redux-thunk';
import type {History} from 'history';

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
