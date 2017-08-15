import 'reflect-metadata';
import { ApplicationRouter, IApplicationRouter } from './routes/';
import {
    AuthenticationService,
    HttpService,
    IAuthenticationService,
    IHttpService,
    IMarkoService,
    IPluginService,
    MarkoService,
    PluginService
    } from './services/';
import { Container } from 'inversify';

class ServiceContainer {

    public container: Container;

    public constructor() {
        this.container = new Container();
        this.bindServices();
        this.bindRouter();
    }

    private bindServices(): void {
        this.container.bind<IPluginService>("IPluginService").to(PluginService);
        this.container.bind<IMarkoService>("IMarkoService").to(MarkoService);
        this.container.bind<IHttpService>("IHttpService").to(HttpService);
        this.container.bind<IAuthenticationService>("IAuthenticationService").to(AuthenticationService);
    }

    private bindRouter(): void {
        this.container.bind<IApplicationRouter>("IApplicationRouter").to(ApplicationRouter);
    }

}
const container = new ServiceContainer().container;
export { container };
