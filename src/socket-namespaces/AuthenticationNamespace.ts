import {
    AuthenticationResult, LoginRequest, SocketEvent, Error, AuthenticationEvent, ISocketRequest
} from '../core/model';
import { SocketResponse } from '../core/common';
import { SocketNameSpace } from './SocketNameSpace';
import { LoggingService, AuthenticationService } from '../core/services';

export class AuthenticationNamespace extends SocketNameSpace {

    private static INSTANCE: AuthenticationNamespace;

    public static getInstance(): AuthenticationNamespace {
        if (!AuthenticationNamespace.INSTANCE) {
            AuthenticationNamespace.INSTANCE = new AuthenticationNamespace();
        }
        return AuthenticationNamespace.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'authentication';
    }

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/' + this.getNamespace());
        nsp.on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
            this.registerEvents(client);
        });
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.registerEventHandler(client, AuthenticationEvent.LOGIN, this.login.bind(this));
        this.registerEventHandler(client, AuthenticationEvent.LOGOUT, this.logout.bind(this));
        this.registerEventHandler(client, AuthenticationEvent.VALIDATE_TOKEN, this.validateToken.bind(this));
    }

    private async login(data: LoginRequest): Promise<SocketResponse<AuthenticationResult>> {
        return new Promise<SocketResponse<AuthenticationResult>>((resolve, reject) => {
            AuthenticationService.getInstance()
                .login(data.userName, data.password, data.userType, data.clientRequestId)
                .then((token: string) => {
                    resolve(
                        new SocketResponse(
                            AuthenticationEvent.AUTHORIZED,
                            new AuthenticationResult(token, data.requestId, '/')
                        )
                    );
                }).catch((error: Error) => {
                    const message = error.Code + ' - ' + error.Message;
                    LoggingService.getInstance().error(message);
                    resolve(
                        new SocketResponse(
                            AuthenticationEvent.UNAUTHORIZED,
                            new AuthenticationResult(null, data.requestId, '/', message)
                        ));
                });
        });
    }

    private async logout(data: ISocketRequest): Promise<SocketResponse<AuthenticationResult>> {
        return new Promise<SocketResponse<AuthenticationResult>>((resolve, reject) => {
            AuthenticationService.getInstance().logout(data.token).then(() => {
                resolve(
                    new SocketResponse(
                        AuthenticationEvent.UNAUTHORIZED, new AuthenticationResult(null, data.requestId)
                    )
                );
            });
        });
    }

    private async validateToken(data: ISocketRequest): Promise<SocketResponse<AuthenticationResult>> {
        return new Promise<SocketResponse<AuthenticationResult>>((resolve, reject) => {
            AuthenticationService.getInstance().validateToken(data.token)
                .then((valid) => {
                    let event = AuthenticationEvent.UNAUTHORIZED;
                    if (valid) {
                        event = AuthenticationEvent.AUTHORIZED;
                    }
                    resolve(new SocketResponse(event, new AuthenticationResult(data.token, data.requestId)));
                });
        });
    }

}
