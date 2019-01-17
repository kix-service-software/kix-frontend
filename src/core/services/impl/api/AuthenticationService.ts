import { Request, Response } from 'express';
import { SocketAuthenticationError, UserType, UserLogin } from '../../../model';
import { LoginResponse, SessionResponse } from '../../../api';
import { HttpService } from './HttpService';

export class AuthenticationService {

    private static INSTANCE: AuthenticationService;

    public static getInstance(): AuthenticationService {
        if (!AuthenticationService.INSTANCE) {
            AuthenticationService.INSTANCE = new AuthenticationService();
        }
        return AuthenticationService.INSTANCE;
    }

    private constructor() { }

    private TOKEN_PREFIX: string = 'Token ';

    public initCache(): Promise<void> {
        return;
    }

    public async isAuthenticated(req: Request, res: Response, next: () => void): Promise<void> {
        const token: string = req.cookies.token;
        if (!token) {
            res.redirect('/auth');
        } else {
            const valid = await this.validateToken(token)
                .catch((error) => {
                    return false;
                });

            if (valid) {
                next();
            } else {
                res.redirect('/auth');
            }
        }
    }

    public async isSocketAuthenticated(socket: SocketIO.Socket, next: (err?: any) => void): Promise<void> {
        if (socket.handshake.query) {
            const token = socket.handshake.query.Token;
            if (token && await this.validateToken(token)) {
                next();
            } else {
                next(new SocketAuthenticationError('Invalid Token!'));
            }
        } else {
            next(new SocketAuthenticationError('Missing Token!'));
        }
    }

    public async login(user: string, password: string, type: UserType): Promise<string> {
        const userLogin = new UserLogin(user, password, type);
        const response = await HttpService.getInstance().post<LoginResponse>('sessions', userLogin);
        return response.Token;
    }

    public async logout(token: string): Promise<boolean> {
        const response = await HttpService.getInstance().delete<any>('sessions/' + token);
        return true;
    }

    private async validateToken(token): Promise<boolean> {
        const response = await HttpService.getInstance().get<SessionResponse>('session', {}, token)
            .catch((error) => {
                return { Session: null };
            });

        if (response && response.Session) {
            return true;
        } else {
            return false;
        }
    }
}
