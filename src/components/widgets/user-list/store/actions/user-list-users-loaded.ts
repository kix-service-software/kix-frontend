import { LoadUsersResult } from './../../../../../model/client/socket/users/LoadUsersResult';
import { StateAction } from '../../../../../model/client/store/StateAction';
import { UsersEvent } from '../../../../../model/client/socket/users/';
import { UserListAction } from './UserListAction';

export default (loadResult: LoadUsersResult) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ loadResult });
    });

    return new StateAction(UserListAction.USER_LIST_USERS_LOADED, payload);
};
