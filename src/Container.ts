import 'reflect-metadata';
import { Server } from './Server';
import { Container } from 'inversify';
import {
    ICommunicator,
    AuthenticationCommunicator
} from './communicators/';
import { IRouter } from './routes/IRouter';
import {
    KIXExtensions,
    IRouterExtension,
    ICommunicatorExtension
} from './extensions';
import {
    ApplicationRouter,
    AuthenticationRouter
} from './routes/';
import {
    AuthenticationService,
    ConfigurationService,
    IConfigurationService,
    HttpService,
    IAuthenticationService,
    IHttpService,
    IMarkoService,
    IPluginService,
    MarkoService,
    PluginService,
    ILoggingService,
    LoggingService,
    UserService,
    IUserService,
    ISocketCommunicationService,
    SocketCommunicationService
} from './services/';

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
        this.container.bind<IRouter>("IRouter").to(ApplicationRouter);
        this.container.bind<IRouter>("IRouter").to(AuthenticationRouter);

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
