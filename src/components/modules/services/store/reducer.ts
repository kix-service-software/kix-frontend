import { ServicesState } from './State';
import { ServicesAction } from './actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class ActionHandler {

    public handleAction(state: ServicesState, action): ServicesState {
        switch (action.type) {
            case ServicesAction.SERVICES_INITIALIZE + FULFILLED: {
                return { ...state, socketListener: action.payload.dashboardSocketListener };
            }

            case ServicesAction.SERVICES_CONTAINER_CONFIGURATION_LOADED + FULFILLED: {
                return { ...state, containerConfiguration: action.payload.containerConfiguration };
            }

            default:
                return { ...state };
        }
    }
}

const actionHandler = new ActionHandler();

export default (state, action) => {
    state = state || new ServicesState();

    return actionHandler.handleAction(state, action);
};
