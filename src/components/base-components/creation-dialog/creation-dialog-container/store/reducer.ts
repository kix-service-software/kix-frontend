import { CreationDialogReduxState } from './CreationDialogReduxState';
import { PersonalSettings } from '@kix/core/dist/model/client';
import { CreationDialogAction } from './actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class ActionHandler {

    public handleAction(state: CreationDialogReduxState, action): CreationDialogReduxState {
        switch (action.type) {
            case CreationDialogAction.CREATION_DIALOG_INITIALIZE + FULFILLED: {
                return { ...state, socketListener: action.payload.socketListener };
            }

            case CreationDialogAction.CREATION_DIALOG_LOADED + FULFILLED: {
                return { ...state, creationDialogs: action.payload.creationDialogs };
            }

            default:
                return { ...state };
        }
    }
}

const actionHandler = new ActionHandler();

export default (state, action) => {
    state = state || new CreationDialogReduxState();

    return actionHandler.handleAction(state, action);
};
