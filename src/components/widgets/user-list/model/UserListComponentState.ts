import { UserListConfiguration } from './UserListConfiguration';
import { UIProperty } from '@kix/core/dist/model/client';
export class UserListComponentState {

    public users: any[] = [];

    public configuration: UserListConfiguration = new UserListConfiguration();

    public error: string = null;

}
