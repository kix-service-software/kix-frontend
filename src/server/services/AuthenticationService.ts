/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* eslint-disable max-classes-per-file */

import { Request, Response } from 'express';
import { ConfigurationService } from './ConfigurationService';
import { HttpService } from '../../frontend-applications/agent-portal/server/services/HttpService';
import { SessionResponse } from '../model/SessionResponse';
import { LoginResponse } from '../model/LoginResponse';
import { SocketAuthenticationError } from '../model/SocketAuthenticationError';
import { UserLogin } from '../../frontend-applications/agent-portal/modules/user/model/UserLogin';
import { UserType } from '../../frontend-applications/agent-portal/modules/user/model/UserType';

import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { Socket } from 'socket.io';
import { LoggingService } from './LoggingService';
import { HTTPResponse } from '../../frontend-applications/agent-portal/server/services/HTTPResponse';
import { IncomingHttpHeaders } from 'node:http';
import { AuthMethod } from '../../frontend-applications/agent-portal/model/AuthMethod';

export class AuthenticationService {

    private static INSTANCE: AuthenticationService;

    public static getInstance(): AuthenticationService {
        if (!AuthenticationService.INSTANCE) {
            AuthenticationService.INSTANCE = new AuthenticationService();
        }
        return AuthenticationService.INSTANCE;
    }

    private tokenSecret: string;

    private constructor() {
        const config = ConfigurationService.getInstance().getServerConfiguration();
        this.tokenSecret = config?.FRONTEND_TOKEN_SECRET;
    }

    private createToken(userLogin: string, backendToken: string): string {
        const token = jwt.sign({ userLogin, backendToken, created: Date.now() }, this.tokenSecret);
        return token;
    }

    public getBackendToken(token: string): string {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        if (serverConfig.BACKEND_API_TOKEN === token) {
            return token;
        }

        const decoded = this.decodeToken(token);
        return decoded && decoded.backendToken ? decoded.backendToken : null;
    }

    public decodeToken(token: string, secret: string = this.tokenSecret): any {
        return jwt.decode(token, secret);
    }

    public async validateToken(token: string, clientRequestId: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            HttpService.getInstance().get<SessionResponse>(
                'session', {}, token, clientRequestId, null, false
            ).then((response: HTTPResponse<SessionResponse>) => {
                resolve(
                    typeof response?.responseData?.Session !== 'undefined' &&
                    response?.responseData?.Session !== null
                );
            }).catch((error) => {
                resolve(false);
            });
        });
    }

    public async isAuthenticated(req: Request, res: Response, next: () => void): Promise<void> {
        const token: string = req.cookies.token;

        let redirect = true;

        if (token) {
            const valid = await this.validateToken(token, 'AuthenticationService').catch((error) => false);

            if (valid) {
                redirect = false;
                res.cookie('token', token, { httpOnly: true });
                next();
            }
        }

        if (redirect) {
            res.clearCookie('token');

            let query = '';
            if (!req.url?.startsWith('auth')) {
                const url = encodeURIComponent(req.url);
                query = `?redirectUrl=${url}`;
            }

            res.redirect(`/auth${query}`);
        }
    }

    public async isSocketAuthenticated(socket: Socket, next: (err?: any) => void): Promise<void> {
        if (socket?.handshake?.headers?.cookie) {
            const parsedCookie = cookie.parse(socket.handshake.headers.cookie);

            const tokenPrefix = socket?.handshake?.headers?.tokenprefix || '';
            const token = parsedCookie[`${tokenPrefix}token`];

            if (token) {
                const valid = await this.validateToken(token, 'AuthenticationService')
                    .catch(() => next(new SocketAuthenticationError('Error validating token!')));

                if (valid) {
                    next();
                } else {
                    next(new SocketAuthenticationError('Invalid Token!'));
                }
            } else {
                next(new SocketAuthenticationError('Invalid Token!'));
            }
        } else {
            LoggingService.getInstance().error('Invalid Cookie!');
            LoggingService.getInstance().error(socket?.handshake?.headers?.cookie);
            LoggingService.getInstance().error(JSON.stringify(socket?.handshake));
            next(new SocketAuthenticationError(`Invalid Cookie! ${JSON.stringify(socket?.handshake)}`));
        }
    }

    public async login(
        login: string, password: string, userType: UserType, negotiateToken: string,
        clientRequestId: string, headers: IncomingHttpHeaders, fakeLogin?: boolean,
        additionalData?: any
    ): Promise<string> {
        const userLogin = new UserLogin(login, password, userType, negotiateToken);

        if (additionalData) {
            for (const key in additionalData) {
                if (additionalData[key]) {
                    userLogin[key] = additionalData[key];
                }
            }
        }

        const response = await HttpService.getInstance().post<LoginResponse>(
            'auth', userLogin, null, clientRequestId, undefined, false, null, headers
        );
        const token = fakeLogin ? response.Token : this.createToken(login, response.Token);

        const user = await HttpService.getInstance().getUserByToken(token);
        if (!user?.Contact?.ID) {
            await this.logout(token);
            LoggingService.getInstance().error(`No contact available for user ${login}!`);
            throw new SocketAuthenticationError('No contact available for user!');
        }

        return token;
    }

    public async logout(token: string): Promise<boolean> {
        await HttpService.getInstance().delete(['session'], token, null).catch((error) => null);
        return true;
    }

    public getUsageContext(token: string): string {
        const backendToken = this.getBackendToken(token);
        const tokenValue = this.decodeToken(backendToken);
        return tokenValue.UserType;
    }

    public async getAuthMethods(userType: UserType = UserType.AGENT): Promise<AuthMethod[]> {
        const authMethods: AuthMethod[] = [];
        const response = await HttpService.getInstance().get(
            'auth', { UserType: userType }, null, 'AuthenticationService', 'AuthMethods', false
        );

        if (response?.responseData) {
            const methods = response.responseData['AuthMethods'];
            if (Array.isArray(methods)) {
                for (const method of methods) {
                    authMethods.push(new AuthMethod(method.Type, Boolean(method.PreAuth), method.Data));
                }
            }
        }

        return authMethods;
    }

    public async getAuthMethod(name: string, userType: UserType = UserType.AGENT): Promise<AuthMethod> {
        const methods = await this.getAuthMethods(userType);
        return methods?.find((m) => m.name === name);
    }
}
