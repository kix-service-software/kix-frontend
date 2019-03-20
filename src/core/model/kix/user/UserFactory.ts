import { User } from "./User";

export class UserFactory {

    public static create(user: User): User {
        const newUser = new User(user);
        return newUser;
    }

}
