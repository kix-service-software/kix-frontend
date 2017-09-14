import { DeleteActionState } from './DeleteActionState';
import { DeleteAction } from './actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class DeleteActionHandler {

    public handleLoginAction(state: DeleteActionState, action): DeleteActionState {
        switch (action.type) {

            case DeleteAction.DELETE_ACTION_INITIALIZE + FULFILLED:
                return { ...state, socketListener: action.payload.socketListener };

            case DeleteAction.DELETE_ACTION_FINISHED + FULFILLED:
                return { ...state, running: false };

            default:
                return { ...state };
        }
    }
}

const userListActionHandler = new DeleteActionHandler();

export default (state, action) => {
    state = state || new DeleteActionState();

    return userListActionHandler.handleLoginAction(state, action);
};
