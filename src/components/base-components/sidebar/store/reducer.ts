import { SidebarState } from './';
import { SidebarAction } from './actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class SidebarActionHandler {

    public handleSidebarAction(state: SidebarState, action): SidebarState {
        switch (action.type) {
            case SidebarAction.SIDEBAR_INITIALIZE + FULFILLED:
                return { ...state, socketlListener: action.payload.socketListener };

            case SidebarAction.SIDEBAR_CONFIGURATION_LOADED + FULFILLED:
                return {
                    ...state,
                    configuration: action.payload.configuration
                };

            case SidebarAction.SIDEBAR_ERROR + FULFILLED:
                return { ...state, error: action.payload.error };

            default:
                return { ...state };
        }
    }
}

const sidebarActionHandler = new SidebarActionHandler();

export default (state, action) => {
    state = state || new SidebarState();

    return sidebarActionHandler.handleSidebarAction(state, action);
};
