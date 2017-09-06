import { User } from './../../../../../model/client/user/User';
import { StateAction } from '../../../../../model/client/store/StateAction';
import { UsersEvent } from '../../../../../model/client/socket/users/';
import { UserListAction } from './UserListAction';

export default (users: User[]) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ users });
    });

    return new StateAction(UserListAction.USER_LIST_USERS_LOADED, payload);
};
