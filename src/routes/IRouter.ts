import { IUserService } from './../services/IUserService';
import { IPluginService } from './../services/IPluginService';
import { IAuthenticationService } from './../services/IAuthenticationService';
import { IConfigurationService } from './../services/IConfigurationService';
import { Router } from 'express';

export interface IRouter {

    getRouter(): Router;

    getBaseRoute(): string;

}
