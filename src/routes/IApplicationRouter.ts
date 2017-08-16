import { Request, Response } from 'express';

export interface IApplicationRouter {

    router: any;

    getRoot(req: Request, res: Response): void;

}
