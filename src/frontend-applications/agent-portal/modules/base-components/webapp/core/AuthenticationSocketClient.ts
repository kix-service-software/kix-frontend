/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketClient } from './SocketClient';
import { AuthenticationEvent } from './AuthenticationEvent';
import { AuthenticationResult } from './AuthenticationResult';
import { ClientStorageService } from './ClientStorageService';
import { LoginRequest } from './LoginRequest';
import { ISocketRequest } from './ISocketRequest';
import { ISocketResponse } from './ISocketResponse';
import { PermissionCheckRequest } from './PermissionCheckRequest';
import { IdService } from '../../../../model/IdService';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';

import { BrowserCacheService } from './CacheService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';

export class AuthenticationSocketClient extends SocketClient {

    private static INSTANCE: AuthenticationSocketClient = null;

    public static getInstance(): AuthenticationSocketClient {
        if (!AuthenticationSocketClient.INSTANCE) {
            AuthenticationSocketClient.INSTANCE = new AuthenticationSocketClient();
        }

        return AuthenticationSocketClient.INSTANCE;
    }

    public constructor() {
        super('authentication');
    }

    public async login(
        userName: string, password: string, negotiateToken: string, redirectUrl: string, fakeLogin?: boolean
    ): Promise<boolean> {
        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<boolean>((resolve, reject) => {

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + AuthenticationEvent.LOGIN);
            }, socketTimeout);

            const requestId = IdService.generateDateBasedId();

            this.socket.on(AuthenticationEvent.AUTHORIZED, (result: AuthenticationResult) => {
                if (result.requestId === requestId) {
                    window.clearTimeout(timeout);
                    if (!fakeLogin) {
                        document.cookie = 'token=' + result.token;
                        window.location.replace(result.redirectUrl);
                    }
                    resolve(true);
                }
            });

            this.socket.on(AuthenticationEvent.UNAUTHORIZED, (result: AuthenticationResult) => {
                if (result.requestId === requestId) {
                    window.clearTimeout(timeout);
                    resolve(false);
                }
            });

            const request = new LoginRequest(
                userName, password, negotiateToken, redirectUrl, requestId,
                ClientStorageService.getClientRequestId()
            );
            this.socket.emit(AuthenticationEvent.LOGIN, request);
        });
    }

    public async logout(): Promise<boolean> {
        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<boolean>((resolve, reject) => {
            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + AuthenticationEvent.LOGOUT);
            }, socketTimeout);

            const requestId = IdService.generateDateBasedId();

            this.socket.on(AuthenticationEvent.UNAUTHORIZED, (result: AuthenticationResult) => {
                if (result.requestId === requestId) {
                    window.clearTimeout(timeout);
                    resolve(true);
                }
            });

            const request: ISocketRequest = {
                requestId,
                clientRequestId: ClientStorageService.getClientRequestId(),
            };
            this.socket.emit(AuthenticationEvent.LOGOUT, request);
        });
    }

    public async validateToken(): Promise<boolean> {
        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<boolean>((resolve, reject) => {

            const requestId = IdService.generateDateBasedId();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + AuthenticationEvent.VALIDATE_TOKEN);
            }, socketTimeout);

            this.socket.on(AuthenticationEvent.AUTHORIZED, (result: AuthenticationResult) => {
                if (result.requestId === requestId) {
                    window.clearTimeout(timeout);
                    resolve(true);
                }
            });

            this.socket.on(AuthenticationEvent.UNAUTHORIZED, (result: AuthenticationResult) => {
                if (result.requestId === requestId) {
                    window.clearTimeout(timeout);
                    resolve(false);
                }
            });

            const request: ISocketRequest = {
                requestId,
                clientRequestId: ClientStorageService.getClientRequestId()
            };
            this.socket.emit(AuthenticationEvent.VALIDATE_TOKEN, request);
        });
    }

    public async checkPermissions(permissions: UIComponentPermission[]): Promise<boolean> {
        const key = JSON.stringify(permissions);
        let requestPromise = BrowserCacheService.getInstance().get(key);
        if (!requestPromise) {
            requestPromise = this.createPermissionRequest(permissions);
            BrowserCacheService.getInstance().set(key, requestPromise, KIXObjectType.ROLE);
        }

        return requestPromise;
    }

    private createPermissionRequest(permissions: UIComponentPermission[]): Promise<boolean> {
        this.checkSocketConnection();

        return new Promise((resolve, reject) => {

            if (!permissions || !permissions.length) {
                resolve(true);
            }

            const requestId = IdService.generateDateBasedId();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + AuthenticationEvent.VALIDATE_TOKEN);
            }, 30000);

            this.socket.on(
                AuthenticationEvent.PERMISSION_CHECK_SUCCESS,
                (result: ISocketResponse) => {
                    if (result.requestId === requestId) {
                        window.clearTimeout(timeout);
                        resolve(true);
                    }
                }
            );

            this.socket.on(
                AuthenticationEvent.PERMISSION_CHECK_FAILED,
                (result: ISocketResponse) => {
                    if (result.requestId === requestId) {
                        window.clearTimeout(timeout);
                        resolve(false);
                    }
                });

            const request = new PermissionCheckRequest(
                requestId,
                ClientStorageService.getClientRequestId(),
                permissions
            );
            this.socket.emit(AuthenticationEvent.PERMISSION_CHECK, request);
        });
    }
}
