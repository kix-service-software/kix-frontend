import { ISocketResponse } from "../ISocketResponse";

export class UpdateObjectResponse implements ISocketResponse {

    public constructor(
        public requestId: string,
        public objectId: string | number
    ) { }

}
