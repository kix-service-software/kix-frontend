import { UserType } from '../model';
import { Request } from 'express';
export interface IAuthenticationService {

    isAuthenticated(req: Request, res: Response, next: () => void): void;

    login(user: string, password: string, type: UserType): Promise<string>;

}
