import { IUserService } from './../services/IUserService';
import { IPluginService } from './../services/IPluginService';
import { IAuthenticationService } from './../services/IAuthenticationService';
import { IConfigurationService } from './../services/IConfigurationService';
import { Router } from 'express';

export interface IRouter {

    router: Router;

    configurationService: IConfigurationService;

    authenticationService: IAuthenticationService;

    pluginService: IPluginService;

    userService: IUserService;

    getRouter(): Router;

    getBaseRoute(): string;

}
