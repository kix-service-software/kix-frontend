export class LoginComponentState {

    public userName: string = "";

    public password: string = "";

    public valid: boolean = false;

    public error: any = null;

    public frontendSocketUrl: string;

    public constructor(frontendSocketUrl: string) {
        this.frontendSocketUrl = frontendSocketUrl;
    }
}
