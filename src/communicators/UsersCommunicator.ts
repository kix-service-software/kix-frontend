import { injectable, inject } from 'inversify';
import { KIXCommunicator } from './KIXCommunicator';

import {
    UserType,
    SocketEvent,
    UIProperty,
    UsersEvent,
    LoadUsersRequest,
    LoadUsersResponse
} from '@kix/core/dist/model';

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
            client.emit(UsersEvent.USERS_LOADED, new LoadUsersResponse([]));
        });
    }
}

// tslint:disable-next-line:max-classes-per-file
class UserConfig {

    public properties: UIProperty[];

    public limit: number;

}
