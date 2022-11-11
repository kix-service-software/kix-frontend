/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* eslint-disable max-classes-per-file */

import { Request, Response } from 'express';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { HttpService } from './HttpService';
import { SessionResponse } from '../model/SessionResponse';
import { LoginResponse } from '../model/LoginResponse';
import { SocketAuthenticationError } from '../../modules/base-components/webapp/core/SocketAuthenticationError';
import { UserLogin } from '../../modules/user/model/UserLogin';
import { UserType } from '../../modules/user/model/UserType';

import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { Socket } from 'socket.io';
import { LoggingService } from '../../../../server/services/LoggingService';
import { CacheService } from './cache';

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
            ).then((response: SessionResponse) => {
                resolve(
                    typeof response !== 'undefined' && response !== null &&
                    typeof response.Session !== 'undefined' && response.Session !== null
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
        if (token) {
            const remoteAddress = req.headers['x-forwarded-for'] ||
                req.socket.remoteAddress ||
                (req.socket ? req.socket.remoteAddress : null);

            this.validateToken(
                token,
                Array.isArray(remoteAddress) ? remoteAddress[0] : remoteAddress,
                'AuthenticationService'
            ).then((valid) => {
                if (valid) {
                    res.cookie('token', token, { httpOnly: true });
                    next();
                } else {
                    res.clearCookie('token');
                    res.redirect('/auth');
                }
            }).catch((error) => {
                res.clearCookie('token');
                res.redirect('/auth');
            });
        } else {
            res.clearCookie('token');
            res.redirect('/auth');
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
            const token = parsedCookie.token;
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
        user: string, password: string, negotiateToken: string, clientRequestId: string,
        remoteAddress: string, fakeLogin?: boolean
    ): Promise<string> {
        const userLogin = new UserLogin(user, password, UserType.AGENT, negotiateToken);
        const response = await HttpService.getInstance().post<LoginResponse>(
            'auth', userLogin, null, clientRequestId, undefined, false
        );
        const token = fakeLogin ? response.Token : this.createToken(user, response.Token, remoteAddress);
        return token;
    }

    public async logout(token: string): Promise<boolean> {
        await HttpService.getInstance().delete(['session'], token, null).catch((error) => null);
        return true;
    }
}

class FrontendToken {
    public userLogin: string;
    public remoteAddress: string;
    public backendToken: string;
    public created: number;
}
