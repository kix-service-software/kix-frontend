import { UserListConfiguration } from './UserListConfiguration';
import { UIProperty } from '@kix/core';
export class UserListComponentState {

    public users: any[] = [];

    public configuration: UserListConfiguration = new UserListConfiguration();

    public error: string = null;

}
