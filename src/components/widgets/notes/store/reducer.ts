import { NotesReduxState } from './NotesReduxState';
import { NotesAction } from './actions';
import { WidgetAction } from '@kix/core/dist/model/client';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class NotesActionHandler {

    public handleLoginAction(state: NotesReduxState, action): NotesReduxState {
        switch (action.type) {

            case NotesAction.NOTES_INITIALIZE + FULFILLED:
                return { ...state, socketListener: action.payload.socketListener };

            case WidgetAction.WIDGET_LOADED + FULFILLED:
                return { ...state, widgetConfiguration: action.payload.widgetConfiguration };

            default:
                return { ...state };
        }
    }
}

const notesActionHandler = new NotesActionHandler();

export default (state, action) => {
    state = state || new NotesReduxState();

    return notesActionHandler.handleLoginAction(state, action);
};
