import { UsersCommunicator } from './../../../../../communicators/UsersCommunicator';
import { TicketCreationProcessReduxState } from './../TicketCreationProcessReduxState';
import { PersonalSettings, ClientStorageHandler } from '@kix/core/dist/model/client';
import { TicketCreationProcessAction } from '../actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';
const REJECTED = '_REJECTED';

class ActionHandler {

    public handleAction(state: TicketCreationProcessReduxState, action): TicketCreationProcessReduxState {
        switch (action.type) {

            case TicketCreationProcessAction.INITIALIZE + FULFILLED:
                state = { ...state, initialized: true, error: null, socketListener: action.payload.socketListener };
                break;

            case TicketCreationProcessAction.CREATE_TICKET + PENDING:
                state = { ...state, createTicketInProcess: true };
                break;
            case TicketCreationProcessAction.CREATE_TICKET + FULFILLED:
                state = {
                    ...state,
                    createTicketInProcess: false,
                    createdTicketId: action.payload.ticketId,
                    createTicketSuccessful: true
                };
                break;
            case TicketCreationProcessAction.CREATE_TICKET + REJECTED:
                state = {
                    ...state,
                    createTicketInProcess: false,
                    createTicketSuccessful: false,
                    error: action.payload.error
                };
                break;

            case TicketCreationProcessAction.RESET_TICKET_CREATION + PENDING:
                state = {
                    ... new TicketCreationProcessReduxState(),
                    socketListener: state.socketListener,
                    resetTicketCreationInProcess: true,
                };
                break;

            case TicketCreationProcessAction.RESET_TICKET_CREATION + FULFILLED:
                state = { ...state, resetTicketCreationInProcess: false };
                break;

            case TicketCreationProcessAction.LOAD_TICKET_STATES + PENDING:
                state = { ...state, loadTicketData: true };
                break;
            case TicketCreationProcessAction.TICKET_DATA_LOADED + FULFILLED:
                state = {
                    ...state,
                    loadTicketData: false,
                    ticketTemplates: action.payload.ticketTemplates,
                    queues: action.payload.queues,
                    services: action.payload.services,
                    slas: action.payload.slas,
                    priorities: action.payload.ticketPriorities,
                    states: action.payload.ticketStates,
                    types: action.payload.ticketTypes,
                    users: action.payload.users
                };
                break;

            case TicketCreationProcessAction.SEARCH_USER + PENDING:
                state = { ...state, userSearchInProgress: true };
                break;

            case TicketCreationProcessAction.SEARCH_USER + FULFILLED:
                state = {
                    ...state,
                    userSearchInProgress: false,
                    users: action.payload.user
                };
                break;

            default:
                state = state;
        }

        return state;
    }
}

const actionHandler = new ActionHandler();

export default (state, action) => {
    state = state || new TicketCreationProcessReduxState();
    return actionHandler.handleAction(state, action);
};
