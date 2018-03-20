import {
    AuthenticationResult,
    LoginRequest,
    AuthenticationEvent,
    UserType,
    SocketEvent
} from '@kix/core/dist/model';

import { HttpError } from '@kix/core/dist/api';
import { IServerConfiguration } from '@kix/core/dist/common';

import {
    IAuthenticationService,
    IConfigurationService,
    ILoggingService,
} from '@kix/core/dist/services';

import { injectable, inject } from 'inversify';
import { KIXCommunicator } from './KIXCommunicator';

export class AuthenticationCommunicator extends KIXCommunicator {

    private client: SocketIO.Socket;

    public getNamespace(): string {
        return 'authentication';
    }

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/' + this.getNamespace());
        nsp.on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
            this.registerEvents(client);
        });
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.client = client;
        client.on(AuthenticationEvent.LOGIN, this.login.bind(this));
    }

    private async login(data: LoginRequest): Promise<void> {
        return await this.authenticationService
            .login(data.userName, data.password, data.userType)
            .then((token: string) => {
                this.client.emit(AuthenticationEvent.AUTHORIZED,
                    new AuthenticationResult(token, '/'));
            }).catch((error: HttpError) => {
                this.loggingService.error(error.errorMessage + ' - ' + error.status, error);
                this.client.emit(AuthenticationEvent.UNAUTHORIZED, error);
            });
    }
}
