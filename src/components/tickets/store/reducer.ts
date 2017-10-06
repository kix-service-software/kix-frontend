import { TicketsState } from './TicketState';
import { TicketAction } from './actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class TicketActionHandler {

    public handleTicketAction(state: TicketsState, action): TicketsState {
        switch (action.type) {
            case TicketAction.TICKET_INITIALIZE + FULFILLED: {
                return { ...state, socketListener: action.payload.dashboardSocketListener };
            }

            case TicketAction.TICKET_CONTAINER_CONFIGURATION_LOADED + FULFILLED: {
                return { ...state, containerConfiguration: action.payload.containerConfiguration };
            }

            default:
                return { ...state };
        }
    }
}

const ticketActionHandler = new TicketActionHandler();

export default (state, action) => {
    state = state || new TicketsState();

    return ticketActionHandler.handleTicketAction(state, action);
};
