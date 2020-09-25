import {Dispatch} from "redux";
import axios from "axios";
import handleError from "../../util";
import {PkaEventsRootActionTypes, PkaEventsState, PkaEventsTypes} from "./types";
import {EventWithAllFieldsClass} from "../search/types";

export const loadRandomEvents = () => (dispatch: Dispatch<PkaEventsRootActionTypes>) => {
    dispatch(pkaEventsEventStarted());

    axios
        .get(`/v1/api/events/random`)
        .then(res => {

            let randomEventsResult: PkaEventsState = {
                randomEvents: EventWithAllFieldsClass.DeserializeNormalArr(res.data.data),
            };

            return dispatch(pkaEventsEventSuccess(randomEventsResult))
        })
        .catch(err => {
            err = handleError(err);

            return dispatch(pkaEventsEventFailure(err))
        })
}

const pkaEventsEventStarted = (): PkaEventsRootActionTypes => ({
    type: PkaEventsTypes.STARTED,
});

const pkaEventsEventSuccess = (eventResult: PkaEventsState): PkaEventsRootActionTypes => ({
    type: PkaEventsTypes.SUCCESS,
    payload: eventResult
});

const pkaEventsEventFailure = (err: string): PkaEventsRootActionTypes => ({
    type: PkaEventsTypes.FAILURE,
    meta: {
        error: err
    }
});
