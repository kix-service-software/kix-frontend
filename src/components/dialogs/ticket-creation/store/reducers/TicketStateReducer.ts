import { TicketCreationReduxState } from '../TicketCreationReduxState';
import { PersonalSettings, ClientStorageHandler, DynamicField } from '@kix/core/dist/model/client';
import { TicketCreationDialogAction, TicketCreationProcessAction } from '../actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class ActionHandler {

    public handleAction(state: TicketCreationReduxState, action): TicketCreationReduxState {
        switch (action.type) {

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
                const dynamicField: DynamicField = state.dynamicFields.find((df) => df.Name === action.payload.name);
                if (!dynamicField) {
                    state.dynamicFields.push({
                        Name: action.payload.name,
                        Value: action.payload.value
                    });
                } else {
                    dynamicField.Value = action.payload.value;
                }
                state = { ...state, dynamicFields: Array.from(state.dynamicFields) };
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
                break;

            case TicketCreationDialogAction.TYPE_ID_CHANGED + FULFILLED:
                state = { ...state, typeId: action.payload.typeId };
                ClientStorageHandler.saveState<TicketCreationReduxState>('TicketCreationDialog', state);
                break;

            case TicketCreationDialogAction.USER_ID_CHANGED + FULFILLED:
                if (action.payload.userType === 'owner') {
                    state = { ...state, ownerId: action.payload.userId };
                } else {
                    state = { ...state, responsibleId: action.payload.userId };
                }

                ClientStorageHandler.saveState<TicketCreationReduxState>('TicketCreationDialog', state);
                break;

            case TicketCreationProcessAction.RESET_TICKET_CREATION + FULFILLED:
                state = new TicketCreationReduxState();
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
