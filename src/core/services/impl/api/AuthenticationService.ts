import { Request, Response } from 'express';
import { SocketAuthenticationError, UserType, UserLogin } from '../../../model';
import { LoginResponse, SessionResponse } from '../../../api';
import { HttpService } from './HttpService';
import { ConfigurationService } from '../ConfigurationService';
import { LoggingService } from '../LoggingService';

export class AuthenticationService {

    private static INSTANCE: AuthenticationService;

    public static getInstance(): AuthenticationService {
        if (!AuthenticationService.INSTANCE) {
            AuthenticationService.INSTANCE = new AuthenticationService();
        }
        return AuthenticationService.INSTANCE;
    }

    private frontendTokenCache: Map<string, string> = new Map();

    private backendCallbackToken: string;

    private constructor(private tokenKey = 'kix18-webfrontend-token-key') {
        const jwt = require('jsonwebtoken');
        this.backendCallbackToken = jwt.sign({ name: 'backen-callback', created: Date.now() }, this.tokenKey);
    }

    public getBackendToken(token: string): string {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        if (serverConfig.BACKEND_API_TOKEN === token) {
            return token;
        }

        return this.frontendTokenCache.get(token);
    }

    public getCallbackToken(): string {
        return this.backendCallbackToken;
    }

    public async isAuthenticated(req: Request, res: Response, next: () => void): Promise<void> {
        const token: string = req.cookies.token;
        if (!token) {
            res.redirect('/auth');
        } else {
            this.validateToken(token).then((valid) => {
                valid ? next() : res.redirect('/auth');
            }).catch((error) => {
                return false;
            });
        }
    }

    public async isCallbackAuthenticated(req: Request, res: Response, next: () => void): Promise<void> {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') {
            const token = req.headers.authorization.split(' ')[1];
            if (token) {
                if (token === this.backendCallbackToken) {
                    next();
                } else {
                    res.status(401).send('Not authorized!');
                }
            }
        } else {
            res.status(403).send();
        }
    }

    public async isSocketAuthenticated(socket: SocketIO.Socket, next: (err?: any) => void): Promise<void> {
        if (socket.handshake.query) {
            const token = socket.handshake.query.Token;
            if (token) {
                this.validateToken(token)
                    .then((valid) => valid ? next() : next(new SocketAuthenticationError('Invalid Token!')))
                    .catch(() => new SocketAuthenticationError('Error validating token!'));

            } else {
                next(new SocketAuthenticationError('Invalid Token!'));
            }
        } else {
            next(new SocketAuthenticationError('Missing Token!'));
        }
    }

    public async login(user: string, password: string, type: UserType, clientRequestId: string): Promise<string> {
        const userLogin = new UserLogin(user, password, type);
        const response = await HttpService.getInstance().post<LoginResponse>(
            'sessions', userLogin, null, clientRequestId
        );
        const token = this.createToken(user, response.Token);
        return token;
    }

    public async logout(token: string): Promise<boolean> {
        if (this.frontendTokenCache.has(token)) {
            const backendToken = this.frontendTokenCache.get(token);
            await HttpService.getInstance().delete('sessions/' + backendToken, null, null);
            this.frontendTokenCache.delete(token);
        }
        return true;
    }

    public async validateToken(token: string): Promise<boolean> {
        if (this.frontendTokenCache.has(token)) {
            return new Promise<boolean>((resolve, reject) => {
                HttpService.getInstance().get<SessionResponse>(
                    'session', {}, token, null, null, false
                ).then((response: SessionResponse) => {
                    resolve(
                        typeof response !== 'undefined' && response !== null &&
                        typeof response.Session !== 'undefined' && response.Session !== null
                    );
                }).catch(() => {
                    this.frontendTokenCache.delete(token);
                    resolve(false);
                });
            });
        } else {
            return false;
        }
    }

    private createToken(userLogin: string, backendToken: string): string {
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ userLogin, created: Date.now() }, this.tokenKey);
        this.frontendTokenCache.set(token, backendToken);
        return token;
    }
}
