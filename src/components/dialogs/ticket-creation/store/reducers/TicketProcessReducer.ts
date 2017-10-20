import { TicketCreationProcessReduxState } from './../TicketCreationProcessReduxState';
import { PersonalSettings, ClientStorageHandler } from '@kix/core/dist/model/client';
import { TicketCreationDialogAction } from '../actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class ActionHandler {

    public handleAction(state: TicketCreationProcessReduxState, action): TicketCreationProcessReduxState {
        switch (action.type) {

            case TicketCreationDialogAction.INITIALIZE + FULFILLED:
                state = { ...state, socketListener: action.payload.socketListener };
                break;

            case TicketCreationDialogAction.CREATE_TICKET + PENDING:
                state = { ...state, createTicketInProcess: true };
                break;
            case TicketCreationDialogAction.CREATE_TICKET + FULFILLED:
                state = { ...state, createTicketInProcess: false };
                break;

            case TicketCreationDialogAction.RESET_TICKET_CREATION + PENDING:
                state = { ...state, resetTicketCreationInProcess: true };
                break;
            case TicketCreationDialogAction.RESET_TICKET_CREATION + FULFILLED:
                state = { ...state, resetTicketCreationInProcess: false };
                break;

            case TicketCreationDialogAction.LOAD_TICKET_TEMPLATES + PENDING:
                state = { ...state, loadTicketTemplates: true };
                break;
            case TicketCreationDialogAction.LOAD_TICKET_TEMPLATES + FULFILLED:
                state = { ...state, loadTicketTemplates: false };
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
