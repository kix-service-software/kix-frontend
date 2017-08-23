import { UserType } from './UserType';

export class LoginRequest {

    public constructor(public userName: string, public password: string, public userType: UserType) {

    }

}
