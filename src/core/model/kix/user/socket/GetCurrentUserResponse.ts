import { ISocketResponse } from "../../../socket";
import { User } from "../User";

export class GetCurrentUserResponse implements ISocketResponse {

    public constructor(
        public requestId: string,
        public currentUser: User
    ) { }

}
