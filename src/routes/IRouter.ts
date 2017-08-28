import { Router } from 'express';

export interface IRouter {

    getRouter(): Router;

    getBaseRoute(): string;

}
