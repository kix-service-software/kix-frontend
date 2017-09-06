import { UserListSocketListener } from './../socket/UserListSocketListener';
import { User } from './../../../../model/client/user/User';
export class UserListState {

    public users: User[] = [];

    public socketlListener: UserListSocketListener;

}
