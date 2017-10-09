import { CustomerState } from './State';
import { CustomerAction } from './actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class ActionHandler {

    public handleAction(state: CustomerState, action): CustomerState {
        switch (action.type) {
            case CustomerAction.CUSTOMER_INITIALIZE + FULFILLED: {
                return { ...state, socketListener: action.payload.dashboardSocketListener };
            }

            case CustomerAction.CUSTOMER_CONTAINER_CONFIGURATION_LOADED + FULFILLED: {
                return { ...state, containerConfiguration: action.payload.containerConfiguration };
            }

            default:
                return { ...state };
        }
    }
}

const actionHandler = new ActionHandler();

export default (state, action) => {
    state = state || new CustomerState();

    return actionHandler.handleAction(state, action);
};
