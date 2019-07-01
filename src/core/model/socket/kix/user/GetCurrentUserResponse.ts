import { ISocketResponse } from "../../ISocketResponse";
import { User } from "../../../kix";

export class GetCurrentUserResponse implements ISocketResponse {

    public constructor(
        public requestId: string,
        public currentUser: User
    ) { }

}
