import { User } from './../../user/User';
export class LoadUsersResult {

    public user: User[];

    public constructor(user: User[] = []) {
        this.user = user;
    }

}
