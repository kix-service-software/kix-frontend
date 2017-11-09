import { TicketListAction } from './actions';
import { TicketListReduxState } from './TicketListReduxState';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class UserListActionHandler {

    public handleLoginAction(state: TicketListReduxState, action): TicketListReduxState {
        switch (action.type) {
            case TicketListAction.INITIALIZE + FULFILLED:
                state = { ...state, socketListener: action.payload.socketListener };
                break;
            case TicketListAction.CONFIGURATION_LOADED + FULFILLED:
                state = { ...state, widgetConfiguration: action.payload.configuration };
                break;
            case TicketListAction.LOAD_TICKETS + FULFILLED:
                state = { ...state, tickets: action.payload.tickets };
                break;
            case TicketListAction.ERROR + FULFILLED:
                state = { ...state, error: action.payload.error };
                break;
            default:
                state = { ...state };
        }
        return state;
    }
}

const userListActionHandler = new UserListActionHandler();

export default (state, action) => {
    state = state || new TicketListReduxState();

    return userListActionHandler.handleLoginAction(state, action);
};
