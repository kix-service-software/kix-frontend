export class AuthenticationResult {

    public token: string;
    public redirectUrl: string;

    public constructor(token: string, redirectUrl: string) {
        this.token = token;
        this.redirectUrl = redirectUrl;
    }

}
