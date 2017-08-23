export class LoginState {

    public userName: string = "";

    public password: string = "";

    public valid: boolean = false;

    public error: any = null;

    public socket: SocketIO.Server = null;

}
