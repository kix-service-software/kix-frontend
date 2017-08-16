import { UserType } from './UserType';

export class UserLogin {

    public UserLogin: string;

    public Password: string;

    public UserType: UserType;

    public constructor(userName: string, password: string, userType: UserType) {
        this.UserLogin = userName;
        this.Password = password;
        this.UserType = userType;
    }

}
