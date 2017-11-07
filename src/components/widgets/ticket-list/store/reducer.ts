import { UserListReduxState } from './UserListReduxState';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class UserListActionHandler {

    public handleLoginAction(state: UserListReduxState, action): UserListReduxState {
        switch (action.type) {


            default:
                return { ...state };
        }
    }
}

const userListActionHandler = new UserListActionHandler();

export default (state, action) => {
    state = state || new UserListReduxState();

    return userListActionHandler.handleLoginAction(state, action);
};
