import { injectable, inject } from 'inversify';
import {
    HttpError,
    LoginResponse,
    UserLogin,
} from '../model';
import { UserType } from '../model-client';
import { IAuthenticationService } from './IAuthenticationService';
import { IHttpService } from './IHttpService';
import { Request, Response } from 'express';

@injectable()
export class AuthenticationService implements IAuthenticationService {

    private httpService: IHttpService;

    private TOKEN_PREFIX: string = 'Token ';

    public constructor( @inject("IHttpService") httpService: IHttpService) {
        this.httpService = httpService;
    }

    public isAuthenticated(req: Request, res: Response, next: () => void): void {
        const authorizationHeader: string = req.headers['authorization'];
        if (!authorizationHeader) {
            res.redirect('/auth');
        } else {
            const token = this.getToken(authorizationHeader);
            if (!token) {
                res.redirect('/auth');
            } else {
                // TODO: validate token against Backend!
                next();
            }
        }
    }

    public async login(user: string, password: string, type: UserType): Promise<string> {
        const userLogin = new UserLogin(user, password, type);
        const response = await this.httpService.post<LoginResponse>('sessions', userLogin);
        if (response.Token) {
            return response.Token;
        } else {
            throw new HttpError(403, 'Invalid Login');
        }
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

}
