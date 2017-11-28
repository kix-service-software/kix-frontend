import { FAQState } from './State';
import { FAQAction } from './actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class ActionHandler {

    public handleAction(state: FAQState, action): FAQState {
        switch (action.type) {
            case FAQAction.FAQ_INITIALIZE + FULFILLED: {
                return { ...state, socketListener: action.payload.dashboardSocketListener };
            }

            case FAQAction.FAQ_CONTAINER_CONFIGURATION_LOADED + FULFILLED: {
                return { ...state, rows: action.payload.rows };
            }

            default:
                return { ...state };
        }
    }
}

const actionHandler = new ActionHandler();

export default (state, action) => {
    state = state || new FAQState();

    return actionHandler.handleAction(state, action);
};
