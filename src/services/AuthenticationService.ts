import { SocketAuthenticationError } from './../model/client/socket/SocketAuthenticationError';
import { injectable, inject } from 'inversify';
import {
    HttpError,
    LoginResponse,
    UserLogin,
    Session,
    SessionResponse
} from '../model';
import { UserType } from '../model/client/';
import { IAuthenticationService, IHttpService } from './';
import { Request, Response } from 'express';

@injectable()
export class AuthenticationService implements IAuthenticationService {

    private httpService: IHttpService;
    private TOKEN_PREFIX: string = 'Token ';

    public constructor( @inject("IHttpService") httpService: IHttpService) {
        this.httpService = httpService;
    }

    public async isAuthenticated(req: Request, res: Response, next: () => void): Promise<void> {
        const authorizationHeader: string = req.headers['authorization'];
        if (!authorizationHeader) {
            res.redirect('/auth');
        } else {
            const token = this.getToken(authorizationHeader);
            if (!token) {
                res.redirect('/auth');
            } else if (await this.validateToken(token)) {
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
