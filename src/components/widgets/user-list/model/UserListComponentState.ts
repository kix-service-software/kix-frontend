import { UserListConfiguration } from './UserListConfiguration';
import { UIProperty } from './../../../../model/client/UIProperty';
export class UserListComponentState {

    public users: any[] = [];

    public configuration: UserListConfiguration = new UserListConfiguration();

    public error: string = null;

}
