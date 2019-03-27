import { ISocketRequest } from "../../../socket";

export class GetCurrentUserRequest implements ISocketRequest {

    public constructor(
        public token: string,
        public requestId: string,
        public cache: boolean
    ) { }

}
