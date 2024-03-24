import type {PkaEventSearchResult} from 'LibWasm';
import axios from 'axios';
import type {Dispatch} from 'redux';
import handleError from '../../util';
import {EventResult} from '../search/types';
import {type PkaEventsRootActionTypes, PkaEventsTypes} from './types';

export const loadRandomEvents =
    () =>
    (dispatch: Dispatch<PkaEventsRootActionTypes>): void => {
        dispatch(pkaEventsEventStarted());

        axios
            .get('/v1/api/events/random')
            .then(async (res) => {
                const results: PkaEventSearchResult[] = res.data.data;

                const randomEventsResult = results.map(
                    (r) => new EventResult(r),
                );

                return dispatch(pkaEventsEventSuccess(randomEventsResult));
            })
            .catch((error) => {
                const handledError = handleError(error);

                return dispatch(pkaEventsEventFailure(handledError));
            });
    };

const pkaEventsEventStarted = (): PkaEventsRootActionTypes => ({
    type: PkaEventsTypes.STARTED,
});

const pkaEventsEventSuccess = (
    eventResult: EventResult[],
): PkaEventsRootActionTypes => ({
    type: PkaEventsTypes.SUCCESS,
    payload: eventResult,
});

const pkaEventsEventFailure = (err: string): PkaEventsRootActionTypes => ({
    type: PkaEventsTypes.FAILURE,
    meta: {
        error: err,
    },
});
