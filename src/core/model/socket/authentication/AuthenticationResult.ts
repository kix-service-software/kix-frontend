export class AuthenticationResult {

    public constructor(
        public token: string,
        public requestId: string,
        public redirectUrl?: string,
        public message?: string
    ) { }

}
