import { UserListState } from './UserListState';
import { UserListAction } from './actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class UserListActionHandler {

    public handleLoginAction(state: UserListState, action): UserListState {
        switch (action.type) {

            case UserListAction.USER_LIST_INITIALIZE + FULFILLED:
                return { ...state, socketlListener: action.payload.socketListener };

            case UserListAction.USER_LIST_USERS_LOADED + FULFILLED:
                return {
                    ...state,
                    users: action.payload.loadResult.users,
                    properties: action.payload.loadResult.properties
                };

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
