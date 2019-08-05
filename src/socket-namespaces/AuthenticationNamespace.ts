/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    AuthenticationResult, LoginRequest, SocketEvent, Error, AuthenticationEvent, ISocketRequest, PermissionCheckRequest
} from '../core/model';
import { SocketResponse, SocketErrorResponse } from '../core/common';
import { SocketNameSpace } from './SocketNameSpace';
import { LoggingService, AuthenticationService } from '../core/services';
import { PermissionService } from '../services';

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
        this.registerEventHandler(client, AuthenticationEvent.PERMISSION_CHECK, this.checkPermissions.bind(this));
    }

    private async login(data: LoginRequest): Promise<SocketResponse> {
        const response = await AuthenticationService.getInstance()
            .login(data.userName, data.password, data.clientRequestId)
            .then((token: string) =>
                new SocketResponse(
                    AuthenticationEvent.AUTHORIZED,
                    new AuthenticationResult(token, data.requestId, data.redirectUrl)
                )
            ).catch((error: Error) =>
                new SocketResponse(
                    AuthenticationEvent.UNAUTHORIZED,
                    new AuthenticationResult(null, data.requestId, '/', 'Unauthorized')
                )
            );

        return response;
    }

    private async logout(data: ISocketRequest): Promise<SocketResponse> {
        const response = await AuthenticationService.getInstance().logout(data.token)
            .then(() =>
                new SocketResponse(
                    AuthenticationEvent.UNAUTHORIZED, new AuthenticationResult(null, data.requestId)
                )
            )
            .catch((error) => new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error)));

        return response;
    }

    private async validateToken(data: ISocketRequest): Promise<SocketResponse> {
        const response = AuthenticationService.getInstance().validateToken(data.token)
            .then((valid) => {
                let event = AuthenticationEvent.UNAUTHORIZED;
                if (valid) {
                    event = AuthenticationEvent.AUTHORIZED;
                }
                return new SocketResponse(event, new AuthenticationResult(data.token, data.requestId));
            })
            .catch((error) => new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error)));

        return response;
    }

    private async checkPermissions(data: PermissionCheckRequest): Promise<SocketResponse> {
        return new Promise<SocketResponse>(async (resolve, reject) => {
            let event = AuthenticationEvent.PERMISSION_CHECK_SUCCESS;

            const allowed = await PermissionService.getInstance().checkPermissions(data.token, data.permissions)
                .catch(() => false);

            if (!allowed) {
                event = AuthenticationEvent.PERMISSION_CHECK_FAILED;
            }

            resolve(new SocketResponse(event, { requestId: data.requestId }));
        });
    }

}
