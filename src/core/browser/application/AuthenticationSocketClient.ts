import { SocketClient } from "../SocketClient";
import { AuthenticationEvent, UserType, AuthenticationResult, ISocketRequest, LoginRequest } from "../../model";
import { IdService } from "../IdService";
import { ClientStorageService } from "../ClientStorageService";

export class AuthenticationSocketClient extends SocketClient {

    private authenticationSocket: SocketIO.Server;

    private static INSTANCE: AuthenticationSocketClient = null;

    public static getInstance(): AuthenticationSocketClient {
        if (!AuthenticationSocketClient.INSTANCE) {
            AuthenticationSocketClient.INSTANCE = new AuthenticationSocketClient();
        }

        return AuthenticationSocketClient.INSTANCE;
    }

    public constructor() {
        super();
        this.authenticationSocket = this.createSocket('authentication', false);
    }

    public login(userName: string, password: string, userType: UserType = UserType.AGENT): Promise<boolean> {
        return new Promise((resolve, reject) => {

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + AuthenticationEvent.LOGIN);
            }, 30000);

            const requestId = IdService.generateDateBasedId();

            this.authenticationSocket.on(AuthenticationEvent.AUTHORIZED, (result: AuthenticationResult) => {
                if (result.requestId === requestId) {
                    window.clearTimeout(timeout);
                    document.cookie = 'token=' + result.token;
                    resolve(true);
                }
            });

            this.authenticationSocket.on(AuthenticationEvent.UNAUTHORIZED, (result: AuthenticationResult) => {
                if (result.requestId === requestId) {
                    window.clearTimeout(timeout);
                    resolve(false);
                }
            });

            const request = new LoginRequest(
                userName, password, userType, requestId, ClientStorageService.getClientRequestId()
            );
            this.authenticationSocket.emit(AuthenticationEvent.LOGIN, request);
        });
    }

    public logout(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + AuthenticationEvent.LOGOUT);
            }, 30000);

            const requestId = IdService.generateDateBasedId();

            this.authenticationSocket.on(AuthenticationEvent.UNAUTHORIZED, (result: AuthenticationResult) => {
                if (result.requestId === requestId) {
                    window.clearTimeout(timeout);
                    resolve(true);
                }
            });

            const request: ISocketRequest = {
                token: '',
                requestId,
                clientRequestId: ClientStorageService.getClientRequestId(),
            };
            this.authenticationSocket.emit(AuthenticationEvent.LOGOUT, request);
        });
    }

    public validateToken(): Promise<boolean> {
        return new Promise((resolve, reject) => {

            const requestId = IdService.generateDateBasedId();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + AuthenticationEvent.VALIDATE_TOKEN);
            }, 30000);

            this.authenticationSocket.on(AuthenticationEvent.AUTHORIZED, (result: AuthenticationResult) => {
                if (result.requestId === requestId) {
                    window.clearTimeout(timeout);
                    resolve(true);
                }
            });

            this.authenticationSocket.on(AuthenticationEvent.UNAUTHORIZED, (result: AuthenticationResult) => {
                if (result.requestId === requestId) {
                    window.clearTimeout(timeout);
                    resolve(false);
                }
            });

            const request: ISocketRequest = {
                token: ClientStorageService.getToken(),
                requestId,
                clientRequestId: ClientStorageService.getClientRequestId()
            };
            this.authenticationSocket.emit(AuthenticationEvent.VALIDATE_TOKEN, request);
        });
    }

}
