import { UserType } from "../../kix";

export class LoginRequest {

    public constructor(
        public userName: string,
        public password: string,
        public userType: UserType,
        public requestId: string,
        public clientRequestId: string
    ) { }

}
