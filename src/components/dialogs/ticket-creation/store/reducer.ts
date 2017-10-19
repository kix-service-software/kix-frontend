import { TicketCreationReduxState } from './TicketCreationReduxState';
import { PersonalSettings, ClientStorageHandler } from '@kix/core/dist/model/client';
import { TicketCreationDialogAction } from './actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class ActionHandler {

    public handleAction(state: TicketCreationReduxState, action): TicketCreationReduxState {
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

            case TicketCreationDialogAction.CUSTOMER_CHANGED + FULFILLED:
                state = { ...state, customer: action.payload.customer };
                ClientStorageHandler.saveState<TicketCreationReduxState>('TicketCreationDialog', state);
                break;

            case TicketCreationDialogAction.CUSTOMER_ID_CHANGED + FULFILLED:
                state = { ...state, customerId: action.payload.customerId };
                ClientStorageHandler.saveState<TicketCreationReduxState>('TicketCreationDialog', state);
                break;

            case TicketCreationDialogAction.DESCRIPTION_CHANGED + FULFILLED:
                state = { ...state, description: action.payload.description };
                ClientStorageHandler.saveState<TicketCreationReduxState>('TicketCreationDialog', state);
                break;

            case TicketCreationDialogAction.DYNAMIC_FIELD_CHANGED + FULFILLED:
                state = { ...state }; // TODO: DYNAMIC FIELD CHANGED
                ClientStorageHandler.saveState<TicketCreationReduxState>('TicketCreationDialog', state);
                break;

            case TicketCreationDialogAction.PENDING_TIME_CHANGED + FULFILLED:
                state = { ...state, pendingTime: action.payload.pendingTime };
                ClientStorageHandler.saveState<TicketCreationReduxState>('TicketCreationDialog', state);
                break;

            case TicketCreationDialogAction.PRIORITY_ID_CHANGED + FULFILLED:
                state = { ...state, priorityId: action.payload.priorityId };
                ClientStorageHandler.saveState<TicketCreationReduxState>('TicketCreationDialog', state);
                break;

            case TicketCreationDialogAction.QUEUE_ID_CHANGED + FULFILLED:
                state = { ...state, queueId: action.payload.queueId };
                ClientStorageHandler.saveState<TicketCreationReduxState>('TicketCreationDialog', state);
                break;

            case TicketCreationDialogAction.SERVICE_ID_CHANGED + FULFILLED:
                state = { ...state, serviceId: action.payload.serviceId };
                ClientStorageHandler.saveState<TicketCreationReduxState>('TicketCreationDialog', state);
                break;

            case TicketCreationDialogAction.SLA_ID_CHANGED + FULFILLED:
                state = { ...state, slaId: action.payload.slaId };
                ClientStorageHandler.saveState<TicketCreationReduxState>('TicketCreationDialog', state);
                break;

            case TicketCreationDialogAction.STATE_ID_CHANGED + FULFILLED:
                state = { ...state, stateId: action.payload.stateId };
                ClientStorageHandler.saveState<TicketCreationReduxState>('TicketCreationDialog', state);
                break;

            case TicketCreationDialogAction.SUBJECT_CHANGED + FULFILLED:
                state = { ...state, subject: action.payload.subject };
                ClientStorageHandler.saveState<TicketCreationReduxState>('TicketCreationDialog', state);
                break;

            case TicketCreationDialogAction.TEMPLATE_CHANGED + FULFILLED:
                state = { ...state }; // TODO: TEMPLATE CHANGED
                ClientStorageHandler.saveState<TicketCreationReduxState>('TicketCreationDialog', state);
                break;

            case TicketCreationDialogAction.TYPE_ID_CHANGED + FULFILLED:
                state = { ...state, typeId: action.payload.typeId };
                ClientStorageHandler.saveState<TicketCreationReduxState>('TicketCreationDialog', state);
                break;

            case TicketCreationDialogAction.USER_ID_CHANGED + FULFILLED:
                state = { ...state, ownerId: action.payload.subject }; // TODO: USER CHANGED
                ClientStorageHandler.saveState<TicketCreationReduxState>('TicketCreationDialog', state);
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
