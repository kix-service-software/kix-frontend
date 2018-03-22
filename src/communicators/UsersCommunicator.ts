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
import { CommunicatorResponse } from '@kix/core/dist/common';

export class UsersCommunicator extends KIXCommunicator {

    protected getNamespace(): string {
        return 'users';
    }

    protected registerEvents(): void {
        this.registerEventHandler(UsersEvent.LOAD_USERS, this.loadUsers.bind(this));
    }

    private async loadUsers(data: LoadUsersRequest): Promise<CommunicatorResponse> {
        return new CommunicatorResponse(UsersEvent.USERS_LOADED, new LoadUsersResponse([]));
    }
}

// tslint:disable-next-line:max-classes-per-file
class UserConfig {

    public properties: UIProperty[];

    public limit: number;

}
