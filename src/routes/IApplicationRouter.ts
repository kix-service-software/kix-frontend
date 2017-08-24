import { IRouter } from './IRouter';
import { Request, Response } from 'express';

export interface IApplicationRouter extends IRouter {

    getRoot(req: Request, res: Response): void;

}
