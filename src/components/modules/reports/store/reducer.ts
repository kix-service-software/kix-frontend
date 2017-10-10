import { ReportsState } from './State';
import { ReportsAction } from './actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class ActionHandler {

    public handleAction(state: ReportsState, action): ReportsState {
        switch (action.type) {
            case ReportsAction.REPORTS_INITIALIZE + FULFILLED: {
                return { ...state, socketListener: action.payload.dashboardSocketListener };
            }

            case ReportsAction.REPORTS_CONTAINER_CONFIGURATION_LOADED + FULFILLED: {
                return { ...state, containerConfiguration: action.payload.containerConfiguration };
            }

            default:
                return { ...state };
        }
    }
}

const actionHandler = new ActionHandler();

export default (state, action) => {
    state = state || new ReportsState();

    return actionHandler.handleAction(state, action);
};
