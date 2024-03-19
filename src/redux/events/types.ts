import type {EventResult} from '../search/types';

export interface PkaEventsState {
    randomEvents: EventResult[];
    isLoading?: boolean;
    errors: string[];
}

export enum PkaEventsTypes {
    STARTED = 'PKA_EVENTS_STARTED',
    FAILURE = 'PKA_EVENTS_FAILURE',
    SUCCESS = 'PKA_EVENTS_SUCCESS',
}

interface PkaEventsSuccess {
    type: PkaEventsTypes.SUCCESS;
    payload: EventResult[];
}

interface PkaEventsFailure {
    type: PkaEventsTypes.FAILURE;
    meta: {
        error: string;
    };
}

interface PkaEventsStarted {
    type: PkaEventsTypes.STARTED;
}

type PkaEventsActionTypes =
    | PkaEventsStarted
    | PkaEventsFailure
    | PkaEventsSuccess;

export type PkaEventsRootActionTypes = PkaEventsActionTypes;
