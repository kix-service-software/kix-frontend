import { ISocketResponse } from "../ISocketResponse";

export class CreateObjectResponse implements ISocketResponse {

    public constructor(
        public requestId: string,
        public objectId: string | number
    ) { }

}
