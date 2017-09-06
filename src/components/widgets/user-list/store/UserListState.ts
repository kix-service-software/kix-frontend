import { UIProperty } from './../../../../model/client/UIProperty';
import { UserListSocketListener } from './../socket/UserListSocketListener';

export class UserListState {

    public users: any[] = [];

    public properties: UIProperty[] = [];

    public socketlListener: UserListSocketListener;

}
