import { HttpError } from './../model/http/HttpError';
import { IAuthenticationService } from './IAuthenticationService';
import { IHttpService } from './IHttpService';
import { UserType, ILoginResponse } from '../model';

export class AuthenticationService implements IAuthenticationService {

    private httpService: IHttpService;

    public constructor(httpService: IHttpService) {
        this.httpService = httpService;
    }

    public isAuthenticated(req: Request, res: Response, next: () => void): void {
        const authorizationHeader: string = req.headers['authorization'];
        if (!authorizationHeader) {
            // TODO: Redirect to login
        } else {
            const token = this.getToken(authorizationHeader);
            if (!token) {
                // TODO Redirect to login
            } else {
                // TODO validate token?
                next();
            }
        }
    }

    public async login(user: string, password: string, type: UserType): Promise<string> {
        return await this.httpService.post('auth/login', {
            UserLogin: user,
            Password: password,
            UserType: type.valueOf()
        }).then((response: ILoginResponse) => {
            return response.token;
        }).catch((error: HttpError) => {
            return error.error;
        });
    }

    private getToken(authorizationHeader: string): string {
        const token = authorizationHeader.substr('Token: '.length, authorizationHeader.length);
        return token;
    }

}
