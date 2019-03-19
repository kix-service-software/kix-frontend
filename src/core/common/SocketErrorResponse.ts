export class SocketErrorResponse {

    public constructor(
        public requestId: string,
        public error: any
    ) { }

}
