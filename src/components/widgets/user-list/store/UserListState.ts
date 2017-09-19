import { UserListConfiguration } from './../model/UserListConfiguration';
import { UIProperty } from '@kix/core/dist/model/client';
import { UserListSocketListener } from './../socket/UserListSocketListener';

export class UserListState {

    public users: any[] = [];

    public configuration: UserListConfiguration;

    public socketListener: UserListSocketListener;

    public error: string;

}
