import { CMDBState } from './State';
import { CMDBAction } from './actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class CMDBActionHandler {

    public handleAction(state: CMDBState, action): CMDBState {
        switch (action.type) {
            case CMDBAction.CMDB_INITIALIZE + FULFILLED: {
                return { ...state, socketListener: action.payload.dashboardSocketListener };
            }

            case CMDBAction.CMDB_CONTAINER_CONFIGURATION_LOADED + FULFILLED: {
                return { ...state, rows: action.payload.rows };
            }

            default:
                return { ...state };
        }
    }
}

const cmdbActionHandler = new CMDBActionHandler();

export default (state, action) => {
    state = state || new CMDBState();

    return cmdbActionHandler.handleAction(state, action);
};
