/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketNameSpace } from './SocketNameSpace';
import { SocketEvent } from '../../modules/base-components/webapp/core/SocketEvent';
import { AuthenticationEvent } from '../../modules/base-components/webapp/core/AuthenticationEvent';
import { LoginRequest } from '../../modules/base-components/webapp/core/LoginRequest';
import { SocketResponse } from '../../modules/base-components/webapp/core/SocketResponse';
import { AuthenticationService } from '../services/AuthenticationService';
import { AuthenticationResult } from '../../modules/base-components/webapp/core/AuthenticationResult';
import { ISocketRequest } from '../../modules/base-components/webapp/core/ISocketRequest';
import { SocketErrorResponse } from '../../modules/base-components/webapp/core/SocketErrorResponse';
import { PermissionCheckRequest } from '../../modules/base-components/webapp/core/PermissionCheckRequest';
import { PermissionService } from '../services/PermissionService';

import * as cookie from 'cookie';
import { Server, Socket } from 'socket.io';

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

    public registerNamespace(socketIO: Server): void {
        const nsp = socketIO.of('/' + this.getNamespace());
        nsp.on(SocketEvent.CONNECTION, (client: Socket) => {
            this.registerEvents(client);
        });
    }

    protected registerEvents(client: Socket): void {
        this.registerEventHandler(client, AuthenticationEvent.LOGIN, this.login.bind(this));
        this.registerEventHandler(client, AuthenticationEvent.LOGOUT, this.logout.bind(this));
        this.registerEventHandler(client, AuthenticationEvent.VALIDATE_TOKEN, this.validateToken.bind(this));
        this.registerEventHandler(client, AuthenticationEvent.PERMISSION_CHECK, this.checkPermissions.bind(this));
    }

    private async login(data: LoginRequest, client: Socket): Promise<SocketResponse> {
        const response = await AuthenticationService.getInstance()
            .login(data.userName, data.password, data.clientRequestId, client.handshake.address)
            .then((token: string) => {
                return new SocketResponse(
                    AuthenticationEvent.AUTHORIZED,
                    new AuthenticationResult(token, data.requestId, data.redirectUrl)
                );
            }).catch((error: Error) =>
                new SocketResponse(
                    AuthenticationEvent.UNAUTHORIZED,
                    new AuthenticationResult(null, data.requestId, '/', 'Unauthorized')
                )
            );

        return response;
    }

    private async logout(data: ISocketRequest, client: Socket): Promise<SocketResponse> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;
        const token = parsedCookie ? parsedCookie.token : '';

        const response = await AuthenticationService.getInstance().logout(token)
            .then(() => {
                const tokenCookie = cookie.serialize('token', '', { expires: new Date() });
                client.handshake.headers.cookie = tokenCookie;
                return new SocketResponse(
                    AuthenticationEvent.UNAUTHORIZED, new AuthenticationResult(null, data.requestId)
                );
            }
            )
            .catch((error) => new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error)));

        return response;
    }

    private async validateToken(data: ISocketRequest, client: Socket): Promise<SocketResponse> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;
        const token = parsedCookie ? parsedCookie.token : '';

        const response = AuthenticationService.getInstance().validateToken(token, client.handshake.address)
            .then((valid) => {
                let event = AuthenticationEvent.UNAUTHORIZED;
                if (valid) {
                    event = AuthenticationEvent.AUTHORIZED;
                }
                return new SocketResponse(event, new AuthenticationResult(token, data.requestId));
            })
            .catch((error) => new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error)));

        return response;
    }

    private async checkPermissions(data: PermissionCheckRequest, client: Socket): Promise<SocketResponse> {
        const parsedCookie = client && client.handshake ? cookie.parse(client.handshake.headers.cookie) : null;
        const token = parsedCookie ? parsedCookie.token : '';

        let event = AuthenticationEvent.PERMISSION_CHECK_SUCCESS;

        const allowed = await PermissionService.getInstance().checkPermissions(token, data.permissions, data.object)
            .catch(() => false);

        if (!allowed) {
            event = AuthenticationEvent.PERMISSION_CHECK_FAILED;
        }

        return new SocketResponse(event, { requestId: data.requestId });
    }

}
