import { UserType } from '..';

export class LoginRequest {

    public userName: string;
    public password: string;
    public userType: UserType;

    public constructor(userName: string, password: string, userType: UserType) {
        this.userName = userName;
        this.password = password;
        this.userType = userType;
    }

}
