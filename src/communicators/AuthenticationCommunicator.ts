import { IServerConfiguration } from './../model/';
import {
    AuthenticationResult,
    LoginRequest,
    AuthenticationEvent
} from './../model/client/socket/login';
import { UserType } from './../model/client/';
import { SocketEvent } from './../model/client/socket/SocketEvent';

import { HttpError } from './../model/http/HttpError';
import { injectable, inject } from 'inversify';
import { IAuthenticationService, IConfigurationService, ILoggingService } from './../services/';
import { KIXCommunicator } from './KIXCommunicator';

export class AuthenticationCommunicator extends KIXCommunicator {

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/authentication');
        nsp.on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
            this.registerLoginEvents(client);
        });
    }

    private registerLoginEvents(client: SocketIO.Socket): void {
        client.on(AuthenticationEvent.LOGIN, async (data: LoginRequest) => {
            return await this.authenticationService
                .login(data.userName, data.password, data.userType)
                .then((token: string) => {
                    client.emit(AuthenticationEvent.AUTHORIZED,
                        new AuthenticationResult(token, '/'));
                }).catch((error: HttpError) => {
                    this.loggingService.error(error.errorMessage + ' - ' + error.status, error);
                    client.emit(AuthenticationEvent.UNAUTHORIZED, error);
                });
        });
    }
}
