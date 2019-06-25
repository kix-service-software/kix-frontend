import { ISocketResponse } from "../model";

export class SocketResponse<T = ISocketResponse> {

    public constructor(
        public event: string,
        public data?: T
    ) { }
}
