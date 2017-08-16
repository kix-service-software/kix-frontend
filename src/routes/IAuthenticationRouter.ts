import { Request, Response } from 'express';

export interface IAuthenticationRouter {

    router: any;

    login(req: Request, res: Response): void;

}
