import { Container } from 'inversify';
import 'reflect-metadata';
import {
    ApplicationRouter,
    AuthenticationRouter,
    IApplicationRouter,
    IAuthenticationRouter
} from './routes/';
import {
    AuthenticationService,
    HttpService,
    IAuthenticationService,
    IHttpService,
    IMarkoService,
    IPluginService,
    MarkoService,
    PluginService,
    ILoggingService,
    LoggingService
} from './services/';

class ServiceContainer {

    public container: Container;

    public constructor() {
        this.container = new Container();
        this.bindServices();
        this.bindRouter();
    }

    private bindServices(): void {
        this.container.bind<ILoggingService>("ILoggingService").to(LoggingService);
        this.container.bind<IPluginService>("IPluginService").to(PluginService);
        this.container.bind<IMarkoService>("IMarkoService").to(MarkoService);
        this.container.bind<IHttpService>("IHttpService").to(HttpService);
        this.container.bind<IAuthenticationService>("IAuthenticationService").to(AuthenticationService);
    }

    private bindRouter(): void {
        this.container.bind<IApplicationRouter>("IApplicationRouter").to(ApplicationRouter);
        this.container.bind<IAuthenticationRouter>("IAuthenticationRouter").to(AuthenticationRouter);
    }

}

const container = new ServiceContainer().container;
export { container };
