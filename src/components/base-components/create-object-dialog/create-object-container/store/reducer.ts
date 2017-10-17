import { CreateObjectDialogReduxState } from './CreateObjectDialogReduxState';
import { PersonalSettings } from '@kix/core/dist/model/client';
import { CreateDialogAction } from './actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class ActionHandler {

    public handleAction(state: CreateObjectDialogReduxState, action): CreateObjectDialogReduxState {
        switch (action.type) {
            case CreateDialogAction.CREATE_DIALOG_INITIALIZE + FULFILLED: {
                return { ...state, socketListener: action.payload.socketListener };
            }

            case CreateDialogAction.CREATE_DIALOG_LOADED + FULFILLED: {
                return { ...state, createDialogs: action.payload.createDialogs };
            }

            default:
                return { ...state };
        }
    }
}

const actionHandler = new ActionHandler();

export default (state, action) => {
    state = state || new CreateObjectDialogReduxState();

    return actionHandler.handleAction(state, action);
};
