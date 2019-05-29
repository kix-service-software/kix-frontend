import { ISocketResponse } from "../model";

export class SocketResponse<T> {

    public constructor(
        public event: string,
        public data?: ISocketResponse
    ) { }
}
