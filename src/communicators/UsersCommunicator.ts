import { User } from './../model/client/user/User';
import { UserType } from './../model/client/';
import { SocketEvent } from './../model/client/socket/SocketEvent';
import { injectable, inject } from 'inversify';
import { KIXCommunicator } from './KIXCommunicator';
import { UsersEvent, LoadUsersRequest, LoadUsersResult } from '../model/client/socket/users';

export class UsersCommunicator extends KIXCommunicator {

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/users');
        nsp
            .use(this.authenticationService.isSocketAuthenticated.bind(this.authenticationService))
            .on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
                this.registerUsersEvents(client);
            });
    }

    private registerUsersEvents(client: SocketIO.Socket): void {
        client.on(UsersEvent.LOAD_USERS, async (data: LoadUsersRequest) => {
            const apiUsers = await this.userService.getUsers(data.limit, null, null, data.token);
            const users: User[] = apiUsers.map((u) => new User(u.UserFirstname, u.UserLastname, u.UserLogin));

            client.emit(UsersEvent.USERS_LOADED, new LoadUsersResult(users));
        });
    }
}
