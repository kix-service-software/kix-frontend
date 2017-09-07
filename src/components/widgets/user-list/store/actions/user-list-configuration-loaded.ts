import { UserListConfiguration } from './../../model/UserListConfiguration';
import { LoadUsersResult } from './../../../../../model/client/socket/users/LoadUsersResult';
import { StateAction } from '../../../../../model/client/store/StateAction';
import { UsersEvent } from '../../../../../model/client/socket/users/';
import { UserListAction } from './UserListAction';

export default (configuration: UserListConfiguration) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ configuration });
    });

    return new StateAction(UserListAction.USER_LIST_CONFIGURATION_LOADED, payload);
};
