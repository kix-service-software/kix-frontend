import 'reflect-metadata';
import { Container } from 'inversify';
import { ICommunicator, AuthenticationCommunicator } from './communicators/';
import { IRouter } from './routes/IRouter';
import {
    ApplicationRouter,
    AuthenticationRouter,
    IApplicationRouter,
    IAuthenticationRouter
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
    UserService,
    IUserService,
    ISocketCommunicationService,
    SocketCommunicationService
} from './services/';

class ServiceContainer {

    public container: Container;

    public constructor() {
        this.container = new Container();
        this.bindServices();
        this.bindRouters();
        this.bindCommunicators();
    }

    private bindServices(): void {
        this.container.bind<IConfigurationService>("IConfigurationService").to(ConfigurationService);
        this.container.bind<ISocketCommunicationService>("ISocketCommunicationService").to(SocketCommunicationService);
        this.container.bind<IPluginService>("IPluginService").to(PluginService);
        this.container.bind<IMarkoService>("IMarkoService").to(MarkoService);
        this.container.bind<IHttpService>("IHttpService").to(HttpService);
        this.container.bind<IAuthenticationService>("IAuthenticationService").to(AuthenticationService);
        this.container.bind<IUserService>("IUserService").to(UserService);
    }

    private bindRouters(): void {
        this.container.bind<IRouter>("Router").to(ApplicationRouter);
        this.container.bind<IRouter>("Router").to(AuthenticationRouter);
    }

    private bindCommunicators(): void {
        this.container.bind<ICommunicator>("Communicator").to(AuthenticationCommunicator);
    }

}

const container = new ServiceContainer().container;
export { container };
