import { TicketCreationReduxState } from './TicketCreationReduxState';
import { PersonalSettings } from '@kix/core/dist/model/client';
import { TicketCreationDialogAction } from './actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class ActionHandler {

    public handleAction(state: TicketCreationReduxState, action): TicketCreationReduxState {
        switch (action.type) {
            case TicketCreationDialogAction.CUSTOMER_ID_CHANGED + PENDING:
                state = { ...state, loadCustomerId: true };
                break;
            case TicketCreationDialogAction.CUSTOMER_ID_CHANGED + FULFILLED:
                state = {
                    ...state,
                    customerId: action.payload.customerId,
                    loadCustomerId: false
                };
                break;
            default:
                return null;
        }

        return state;
    }
}

const actionHandler = new ActionHandler();

export default (state, action) => {
    state = state || new TicketCreationReduxState();
    return actionHandler.handleAction(state, action);
};
