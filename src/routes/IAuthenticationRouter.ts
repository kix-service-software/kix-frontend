import { IRouter } from './IRouter';
import { Request, Response } from 'express';

export interface IAuthenticationRouter extends IRouter {

    login(req: Request, res: Response): void;

}
