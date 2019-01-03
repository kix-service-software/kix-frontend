import { ISocketResponse } from "../ISocketResponse";

export class DeleteObjectResponse implements ISocketResponse {

    public constructor(
        public requestId: string
    ) { }

}
