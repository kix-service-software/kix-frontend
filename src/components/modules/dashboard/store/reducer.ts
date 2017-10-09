import { DashboardState } from './DashboardState';
import { DashboardAction } from './actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class DashboardActionHandler {

    public handleDashboardAction(state: DashboardState, action): DashboardState {
        switch (action.type) {
            case DashboardAction.DASHBOARD_INITIALIZE + FULFILLED: {
                return { ...state, socketListener: action.payload.dashboardSocketListener };
            }

            case DashboardAction.DASHBOARD_CONTAINER_CONFIGURATION_LOADED + FULFILLED: {
                return { ...state, containerConfiguration: action.payload.containerConfiguration };
            }

            default:
                return { ...state };
        }
    }
}

const dashboardActionHandler = new DashboardActionHandler();

export default (state, action) => {
    state = state || new DashboardState();

    return dashboardActionHandler.handleDashboardAction(state, action);
};
