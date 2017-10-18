import { TicketCreationReduxState } from './TicketCreationReduxState';
import { PersonalSettings } from '@kix/core/dist/model/client';
import { TicketCreationDialogAction } from './actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class ActionHandler {

    public handleAction(state: TicketCreationReduxState, action): TicketCreationReduxState {
        switch (action.type) {

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

            case TicketCreationDialogAction.SUBJECT_CHANGED + FULFILLED:
                state = { ...state, subject: action.payload.subject };
                break;

            default:
                state = state;
        }

        return state;
    }
}

const actionHandler = new ActionHandler();

export default (state, action) => {
    state = state || new TicketCreationReduxState();
    return actionHandler.handleAction(state, action);
};
