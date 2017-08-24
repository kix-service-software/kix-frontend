import { CreateUser } from './CreateUser';

export class CreateUserRequest {

    public User: CreateUser;

    public constructor(
        login: string, firstName: string, lastName: string,
        email: string, password: string, phone: string, title: string
    ) {
        this.User = new CreateUser(login, firstName, lastName, email, password, phone, title);
    }

}
