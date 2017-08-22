import { Request, Response } from 'express';
import { UserType } from '../model-client';

export interface IAuthenticationService {

    isAuthenticated(req: Request, res: Response, next: () => void): void;

    login(user: string, password: string, type: UserType): Promise<string>;

    logout(token: string): Promise<boolean>;

}
