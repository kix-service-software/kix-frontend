import { injectable, inject } from 'inversify';

import { IAuthenticationService, IHttpService } from '@kix/core/dist/services';
import { UserType, UserLogin, Session, SocketAuthenticationError } from '@kix/core/dist/model';
import { HttpError, LoginResponse, SessionResponse } from '@kix/core/dist/api';

import { Request, Response } from 'express';

@injectable()
export class AuthenticationService implements IAuthenticationService {

    private httpService: IHttpService;
    private TOKEN_PREFIX: string = 'Token ';

    public constructor( @inject("IHttpService") httpService: IHttpService) {
        this.httpService = httpService;
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
        const response = await this.httpService.post<LoginResponse>('sessions', userLogin);
        return response.Token;
    }

    public async logout(token: string): Promise<boolean> {
        const response = await this.httpService.delete<any>('sessions/' + token);
        return true;
    }

    private getToken(authorizationHeader: string): string {
        if (authorizationHeader.startsWith(this.TOKEN_PREFIX)) {
            const token = authorizationHeader.substr(this.TOKEN_PREFIX.length, authorizationHeader.length);
            return token;
        }

        return null;
    }

    private async validateToken(token): Promise<boolean> {
        const response = await this.httpService.get<SessionResponse>('session', {}, token)
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
