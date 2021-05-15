import { Dispatch } from "redux";
import axios from "axios";
import handleError from "../../util";
import { PkaEventsRootActionTypes, PkaEventsTypes } from "./types";
import { EventWithAllFieldsClass } from "../search/types";

export const loadRandomEvents =
    () =>
    (dispatch: Dispatch<PkaEventsRootActionTypes>): void => {
        dispatch(pkaEventsEventStarted());

        axios
            .get(`/v1/api/events/random`)
            .then((res) => {
                const randomEventsResult: EventWithAllFieldsClass[] = EventWithAllFieldsClass.DeserializeNormalArr(
                    res.data.data
                );

                return dispatch(pkaEventsEventSuccess(randomEventsResult));
            })
            .catch((err) => {
                err = handleError(err);

                return dispatch(pkaEventsEventFailure(err));
            });
    };

const pkaEventsEventStarted = (): PkaEventsRootActionTypes => ({
    type: PkaEventsTypes.STARTED,
});

const pkaEventsEventSuccess = (eventResult: EventWithAllFieldsClass[]): PkaEventsRootActionTypes => ({
    type: PkaEventsTypes.SUCCESS,
    payload: eventResult,
});

const pkaEventsEventFailure = (err: string): PkaEventsRootActionTypes => ({
    type: PkaEventsTypes.FAILURE,
    meta: {
        error: err,
    },
});
