import { Request, Response } from 'express';
import { UserType } from '../model-client/authentication';

export interface IAuthenticationService {

    isAuthenticated(req: Request, res: Response, next: () => void): Promise<void>;

    isSocketAuthenticated(socket: SocketIO.Socket, next: (error?: any) => void): Promise<void>;

    login(user: string, password: string, type: UserType): Promise<string>;

    logout(token: string): Promise<boolean>;

}
