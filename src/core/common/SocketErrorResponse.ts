import { ISocketResponse } from "../model";

export class SocketErrorResponse implements ISocketResponse {

    public constructor(
        public requestId: string,
        public error: any
    ) { }

}
