/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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
import { CacheService } from '../../frontend-applications/agent-portal/server/services/cache';
import { HTTPResponse } from '../../frontend-applications/agent-portal/server/services/HTTPResponse';

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

    private async createCallbackToken(): Promise<void> {
        const backendCallbackToken = jwt.sign({ name: 'backend-callback', created: Date.now() }, this.tokenSecret);
        ConfigurationService.getInstance().saveDataFileContent('backend_callback_token.json', { 'CallbackToken': backendCallbackToken });
        await CacheService.getInstance().set('CALLBACK_TOKEN', backendCallbackToken);
    }

    private createToken(userLogin: string, backendToken: string, remoteAddress: string): string {
        const token = jwt.sign({ userLogin, remoteAddress, backendToken, created: Date.now() }, this.tokenSecret);
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

    public async validateToken(token: string, remoteAddress: string, clientRequestId: string): Promise<boolean> {
        const config = ConfigurationService.getInstance().getServerConfiguration();
        if (config.CHECK_TOKEN_ORIGIN) {
            const decodedToken = this.decodeToken(token);
            if (decodedToken.remoteAddress !== remoteAddress) {
                return false;
            }
        }

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

    public async getCallbackToken(): Promise<string> {
        let token = await CacheService.getInstance().get('CALLBACK_TOKEN');
        if (!token) {
            // check if we have one in the filesystem
            const callbackToken = ConfigurationService.getInstance().getDataFileContent('backend_callback_token.json');
            token = callbackToken.CallbackToken;
        }
        if (!token) {
            await this.createCallbackToken();
            token = await CacheService.getInstance().get('CALLBACK_TOKEN');
        }

        return token;
    }

    public async isAuthenticated(req: Request, res: Response, next: () => void): Promise<void> {
        const token: string = req.cookies.token;

        let redirect = true;

        if (token) {
            let remoteAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
            remoteAddress = Array.isArray(remoteAddress) ? remoteAddress[0] : remoteAddress;

            const valid = await this.validateToken(token, remoteAddress, 'AuthenticationService')
                .catch((error) => false);

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

    public async isCallbackAuthenticated(req: Request, res: Response, next: () => void): Promise<void> {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') {
            const token = req.headers.authorization.split(' ')[1];
            if (token) {
                const callbackToken = await this.getCallbackToken();
                if (token === callbackToken) {
                    next();
                } else {
                    res.status(401).send('Not authorized!');
                }
            }
        } else {
            res.status(403).send();
        }
    }

    public async isSocketAuthenticated(socket: Socket, next: (err?: any) => void): Promise<void> {
        if (socket?.handshake?.headers?.cookie) {
            const parsedCookie = cookie.parse(socket.handshake.headers.cookie);

            const tokenPrefix = socket?.handshake?.headers?.tokenprefix || '';
            const token = parsedCookie[`${tokenPrefix}token`];

            if (token) {
                const valid = await this.validateToken(
                    token, socket.handshake.address, 'AuthenticationService'
                ).catch(() => next(new SocketAuthenticationError('Error validating token!')));

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
        clientRequestId: string, remoteAddress: string, fakeLogin?: boolean
    ): Promise<string> {
        const userLogin = new UserLogin(login, password, userType, negotiateToken);
        const response = await HttpService.getInstance().post<LoginResponse>(
            'auth', userLogin, null, clientRequestId, undefined, false
        );
        const token = fakeLogin ? response.Token : this.createToken(login, response.Token, remoteAddress);

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
}
