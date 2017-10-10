import { SearchState } from './State';
import { SearchAction } from './actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class ActionHandler {

    public handleAction(state: SearchState, action): SearchState {
        switch (action.type) {
            case SearchAction.SEARCH_INITIALIZE + FULFILLED: {
                return { ...state, socketListener: action.payload.dashboardSocketListener };
            }

            case SearchAction.SEARCH_CONTAINER_CONFIGURATION_LOADED + FULFILLED: {
                return { ...state, containerConfiguration: action.payload.containerConfiguration };
            }

            default:
                return { ...state };
        }
    }
}

const actionHandler = new ActionHandler();

export default (state, action) => {
    state = state || new SearchState();

    return actionHandler.handleAction(state, action);
};
