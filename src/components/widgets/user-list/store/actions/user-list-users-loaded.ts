import { UsersEvent, StateAction, LoadUsersResult } from '@kix/core';
import { UserListAction } from './UserListAction';

export default (loadResult: LoadUsersResult) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ loadResult });
    });

    return new StateAction(UserListAction.USER_LIST_USERS_LOADED, payload);
};
