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

    private client: SocketIO.Socket;

    public getNamespace(): string {
        return 'users';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.client = client;
        client.on(UsersEvent.LOAD_USERS, this.loadUsers.bind(this));
    }

    private async loadUsers(data: LoadUsersRequest): Promise<void> {
        this.client.emit(UsersEvent.USERS_LOADED, new LoadUsersResponse([]));
    }
}

// tslint:disable-next-line:max-classes-per-file
class UserConfig {

    public properties: UIProperty[];

    public limit: number;

}
