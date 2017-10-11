import { UserListState } from './UserListState';
import { UserListAction, WidgetAction } from './actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class UserListActionHandler {

    public handleLoginAction(state: UserListState, action): UserListState {
        switch (action.type) {

            case UserListAction.USER_LIST_INITIALIZE + FULFILLED:
                return { ...state, socketListener: action.payload.socketListener };

            case UserListAction.USER_LIST_USERS_LOADED + FULFILLED:
                return {
                    ...state,
                    users: action.payload.loadResult.users
                };

            case UserListAction.USER_LIST_ERROR + FULFILLED:
                return { ...state, error: action.payload.error };

            case WidgetAction.WIDGET_LOADED + FULFILLED:
                return { ...state, widgetConfiguration: action.payload.widgetConfiguration };

            default:
                return { ...state };
        }
    }
}

const userListActionHandler = new UserListActionHandler();

export default (state, action) => {
    state = state || new UserListState();

    return userListActionHandler.handleLoginAction(state, action);
};
