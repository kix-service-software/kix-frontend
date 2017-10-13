import { SidebarState } from './';
import { KixSidebarAction } from './actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class KixSidebarActionHandler {

    public handleKixSidebarAction(state: SidebarState, action): SidebarState {
        switch (action.type) {
            case KixSidebarAction.KIX_SIDEBAR_INITIALIZE + FULFILLED:
                return { ...state, socketlListener: action.payload.socketListener };

            case KixSidebarAction.KIX_SIDEBAR_CONFIGURATION_LOADED + FULFILLED:
                return {
                    ...state,
                    configuration: action.payload.configuration
                };

            case KixSidebarAction.KIX_SIDEBAR_ERROR + FULFILLED:
                return { ...state, error: action.payload.error };

            default:
                return { ...state };
        }
    }
}

const kixSidebarActionHandler = new KixSidebarActionHandler();

export default (state, action) => {
    state = state || new SidebarState();

    return kixSidebarActionHandler.handleKixSidebarAction(state, action);
};
