import {
    AuthenticationResult, LoginRequest, AuthenticationEvent, SocketEvent
} from '../core/model';

import { HttpError } from '../core/api';
import { CommunicatorResponse } from '../core/common';

import { KIXCommunicator } from './KIXCommunicator';
import { LoggingService, AuthenticationService } from '../core/services';

export class AuthenticationCommunicator extends KIXCommunicator {

    private static INSTANCE: AuthenticationCommunicator;

    public static getInstance(): AuthenticationCommunicator {
        if (!AuthenticationCommunicator.INSTANCE) {
            AuthenticationCommunicator.INSTANCE = new AuthenticationCommunicator();
        }
        return AuthenticationCommunicator.INSTANCE;
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
    }

    private async login(data: LoginRequest): Promise<CommunicatorResponse<AuthenticationResult>> {
        let response;
        await AuthenticationService.getInstance()
            .login(data.userName, data.password, data.userType)
            .then((token: string) => {
                response = new CommunicatorResponse(
                    AuthenticationEvent.AUTHORIZED,
                    new AuthenticationResult(token, '/'));
            }).catch((error: HttpError) => {
                LoggingService.getInstance().error(error.errorMessage + ' - ' + error.status, error);
                response = new CommunicatorResponse(AuthenticationEvent.UNAUTHORIZED, error);
            });
        return response;
    }
}
