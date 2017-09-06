import { LoadUsersRequest } from './../../../../../model/client/socket/users/LoadUsersRequest';
import { StateAction } from '../../../../../model/client/store/StateAction';
import { UsersEvent } from '../../../../../model/client/socket/users/';
import { UserListAction } from './UserListAction';

export default (socket: SocketIO.Server) => {
    const payload = new Promise((resolve, reject) => {
        resolve(loadEntries(socket));
    });

    return new StateAction(UserListAction.USER_LIST_LOAD_USERS, payload);
};

function loadEntries(socket: SocketIO.Server): any {
    const token = window.localStorage.getItem("token");
    socket.emit(UsersEvent.LOAD_USERS, new LoadUsersRequest(token, 'user-list'));
    return {};
}
