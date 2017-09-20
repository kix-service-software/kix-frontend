import 'reflect-metadata';
import { Container } from 'inversify';
import { Server } from './Server';

import { AuthenticationCommunicator } from './communicators/';

import {
    ApplicationRouter,
    AuthenticationRouter
} from './routes/';

import {
    ICommunicator,
    IRouter,
    KIXExtensions,
    IRouterExtension,
    ICommunicatorExtension,
    IConfigurationService,
    IAuthenticationService,
    IHttpService,
    IMarkoService,
    IPluginService,
    ILoggingService,
    IUserService,
    ISocketCommunicationService
} from '@kix/core';

import { LoggingService } from './services/LoggingService';
import { ConfigurationService } from './services/ConfigurationService';
import { PluginService } from './services/PluginService';
import { SocketCommunicationService } from './services/SocketCommuncationService';
import { MarkoService } from './services/MarkoService';
import { AuthenticationService } from './services/AuthenticationService';
import { HttpService } from './services/HttpService';
import { UserService } from './services/UserService';

export class ServiceContainer {

    private container: Container;

    private initialized: boolean = false;

    public constructor() {
        this.container = new Container();
    }

    public getDIContainer(): Container {
        return this.container;
    }

    public async initialize(): Promise<void> {
        if (!this.initialized) {
            await this.bindServices();
            await this.bindRouters();
            await this.bindCommunicators();

            this.container.bind<Server>("Server").to(Server);
            this.initialized = true;
        }
    }

    private bindServices(): void {
        this.container.bind<ILoggingService>("ILoggingService").to(LoggingService);
        this.container.bind<IConfigurationService>("IConfigurationService").to(ConfigurationService);
        this.container.bind<IPluginService>("IPluginService").to(PluginService);
        this.container.bind<ISocketCommunicationService>("ISocketCommunicationService").to(SocketCommunicationService);
        this.container.bind<IMarkoService>("IMarkoService").to(MarkoService);
        this.container.bind<IHttpService>("IHttpService").to(HttpService);
        this.container.bind<IAuthenticationService>("IAuthenticationService").to(AuthenticationService);
        this.container.bind<IUserService>("IUserService").to(UserService);
    }

    private async bindRouters(): Promise<void> {
        this.container.bind<IRouter>("IRouter").to(AuthenticationRouter);
        this.container.bind<IRouter>("IRouter").to(ApplicationRouter);

        const pluginService = this.container.get<IPluginService>("IPluginService");
        const routerExtensions = await pluginService.getExtensions<IRouterExtension>(KIXExtensions.ROUTER);

        for (const routerExt of routerExtensions) {
            this.container.bind<IRouter>("IRouter").to(routerExt.getRouterClass());
        }
    }

    private async bindCommunicators(): Promise<void> {
        const pluginService = this.container.get<IPluginService>("IPluginService");
        const communicatorExtensions = await pluginService
            .getExtensions<ICommunicatorExtension>(KIXExtensions.COMMUNICATOR);

        for (const communicator of communicatorExtensions) {
            this.container.bind<ICommunicator>("ICommunicator").to(communicator.getCommunicatorClass());
        }
    }

}

const container = new ServiceContainer();
export { container };
