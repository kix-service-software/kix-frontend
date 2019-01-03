import { SocketListener } from "../SocketListener";
import { UserType, AuthenticationResult, LoginRequest, AuthenticationEvent } from "../../model/kix/user";

export class AuthenticationSocketListener extends SocketListener {

    private authenticationSocket: SocketIO.Server;

    private static INSTANCE: AuthenticationSocketListener = null;

    public static getInstance(): AuthenticationSocketListener {
        if (!AuthenticationSocketListener.INSTANCE) {
            AuthenticationSocketListener.INSTANCE = new AuthenticationSocketListener();
        }

        return AuthenticationSocketListener.INSTANCE;
    }

    public constructor() {
        super();
        this.authenticationSocket = this.createSocket("authentication", false);
    }

    public login(userName: string, password: string, userType: UserType): Promise<boolean> {
        return new Promise((resolve, reject) => {

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + AuthenticationEvent.LOGIN);
            }, 30000);

            this.authenticationSocket.on(AuthenticationEvent.AUTHORIZED, (result: AuthenticationResult) => {
                document.cookie = "token=" + result.token;
                resolve(true);
            });

            this.authenticationSocket.on(AuthenticationEvent.UNAUTHORIZED, (error) => {
                resolve(false);
            });

            const request = new LoginRequest(userName, password, UserType.AGENT);
            this.authenticationSocket.emit(AuthenticationEvent.LOGIN, request);
        });
    }
}
