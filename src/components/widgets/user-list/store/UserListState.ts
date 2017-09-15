import { UserListConfiguration } from './../model/UserListConfiguration';
import { UIProperty } from './../../../../model/client/UIProperty';
import { UserListSocketListener } from './../socket/UserListSocketListener';

export class UserListState {

    public users: any[] = [];

    public configuration: UserListConfiguration;

    public socketListener: UserListSocketListener;

    public error: string;

}
