import {type RouterState, connectRouter} from 'connected-react-router';
import type {History} from 'history';
import {type Action, combineReducers} from 'redux';
import type {ThunkDispatch} from 'redux-thunk';
import {pkaEventsReducer} from './events/reducers';
import type {PkaEventsState} from './events/types';
import {searchReducer} from './search/reducers';
import type {SearchState} from './search/types';
import {watchEpisodeReducer} from './watch-episode/reducers';
import type {WatchEpisodeState} from './watch-episode/types';

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
