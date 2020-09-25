import {EventWithAllFieldsClass} from "../search/types";

export interface PkaEventsState {
    randomEvents: EventWithAllFieldsClass[],
    isLoading?: boolean,
    errors?: string[],
}

export enum PkaEventsTypes {
    STARTED = 'PKA_EVENTS_STARTED',
    FAILURE = 'PKA_EVENTS_FAILURE',
    SUCCESS = 'PKA_EVENTS_SUCCESS',
}

interface PkaEventsSuccess {
    type: PkaEventsTypes.SUCCESS,
    payload: PkaEventsState
}

interface PkaEventsFailure {
    type: PkaEventsTypes.FAILURE
    meta: {
        error: string
    }
}

interface PkaEventsStarted {
    type: PkaEventsTypes.STARTED
}

type PkaEventsActionTypes =
    PkaEventsStarted
    | PkaEventsFailure
    | PkaEventsSuccess

export type PkaEventsRootActionTypes = PkaEventsActionTypes
