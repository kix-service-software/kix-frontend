/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { UserType } from '../../../user/model/UserType';
import { LoginResult } from '../../model/LoginResult';
import { MFAToken } from '../../../multifactor-authentication/model/MFAToken';

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
        userName: string, password: string, negotiateToken: string, redirectUrl: string,
        mfaToken?: MFAToken, fakeLogin?: boolean, userType = UserType.AGENT
    ): Promise<LoginResult> {
        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<LoginResult>((resolve, reject) => {

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + AuthenticationEvent.LOGIN);
            }, socketTimeout);

            const requestId = IdService.generateDateBasedId();

            this.socket.on(AuthenticationEvent.AUTHORIZED, (result: AuthenticationResult) => {
                if (result.requestId === requestId) {
                    window.clearTimeout(timeout);
                    if (!fakeLogin) {
                        document.cookie = ClientStorageService.tokenPrefix + 'token=' + result.token;
                        window.location.replace(result.redirectUrl);
                    }
                    resolve(new LoginResult(true));
                }
            });

            this.socket.on(AuthenticationEvent.UNAUTHORIZED, (result: AuthenticationResult) => {
                if (result.requestId === requestId) {
                    window.clearTimeout(timeout);
                    resolve(new LoginResult(false, false));
                }
            });

            this.socket.on(AuthenticationEvent.OTP_REQUIRED, (result: AuthenticationResult) => {
                if (result.requestId === requestId) {
                    window.clearTimeout(timeout);
                    resolve(new LoginResult(true, true));
                }
            });

            const request = new LoginRequest(
                userName, password, userType, negotiateToken, redirectUrl, mfaToken, requestId,
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
                clientRequestId: ClientStorageService.getClientRequestId()
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
            BrowserCacheService.getInstance().set(key, requestPromise, 'OPTION_REQUEST');
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
                permissions,
                undefined
            );
            this.socket.emit(AuthenticationEvent.PERMISSION_CHECK, request);
        });
    }
}
