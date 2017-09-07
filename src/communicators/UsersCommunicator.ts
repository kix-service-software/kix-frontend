import { UIProperty } from './../model/client/';
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
            const fields = [];
            for (const prop of data.properties) {
                fields.push('User.' + prop.name);
            }

            const query = {
                fields: fields.join(',')
            };

            const apiUsers = await this.userService.getUsers(query, data.limit, null, null, data.token);

            const users: any[] = apiUsers.map((u) => {
                const user = {};
                for (const prop of data.properties) {
                    user[prop.name] = u[prop.name];
                }
                return user;
            });

            client.emit(UsersEvent.USERS_LOADED, new LoadUsersResult(users));
        });
    }
}

// tslint:disable-next-line:max-classes-per-file
class UserConfig {

    public properties: UIProperty[];

    public limit: number;

}
