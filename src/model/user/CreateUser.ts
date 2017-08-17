import { User } from './User';

export class CreateUserRequest {

    public User: User;

    public constructor(user: User) {
        this.User = user;
    }

}
