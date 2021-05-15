import { PkaEventsRootActionTypes, PkaEventsState, PkaEventsTypes } from "./types";

const initialState: PkaEventsState = {
    randomEvents: [],
    isLoading: false,
    errors: [],
};

export function pkaEventsReducer(state = initialState, action: PkaEventsRootActionTypes): PkaEventsState {
    switch (action.type) {
        case PkaEventsTypes.STARTED: {
            return {
                ...state,
                isLoading: true,
            };
        }
        case PkaEventsTypes.FAILURE: {
            return {
                ...state,
                isLoading: false,
                errors: [...state.errors, action.meta.error],
            };
        }
        case PkaEventsTypes.SUCCESS: {
            return {
                ...state,
                isLoading: false,
                randomEvents: [...action.payload],
            };
        }
        default:
            return state;
    }
}
