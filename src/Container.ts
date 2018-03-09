import 'reflect-metadata';

import {
    IAuthenticationService,
    IClientRegistrationService, IConfigurationService, IContactService, ICustomerService,
    IDynamicFieldService,
    IGeneralCatalogService,
    IHttpService,
    ILinkService,
    ILoggingService,
    IMarkoService,
    IObjectIconService,
    IPluginService,
    IServiceService, ISysConfigService,
    ISocketCommunicationService,
    ITicketService,
    ITranslationService,
    IUserService,
    IValidObjectService,
    IWidgetRepositoryService
} from '@kix/core/dist/services';
import { ICommunicator } from '@kix/core/dist/common';
import { KIXExtensions, ICommunicatorExtension, IRouterExtension } from '@kix/core/dist/extensions';
import { IRouter } from '@kix/core/dist/routes';

import { Container } from 'inversify';

import { ApplicationRouter, AuthenticationRouter } from './routes/';
import { Server } from './Server';
import {
    AuthenticationService,
    ClientRegistrationService, ConfigurationService, ContactService, CustomerService,
    DynamicFieldService,
    GeneralCatalogService,
    HttpService,
    LinkService, LoggingService,
    MarkoService,
    ObjectIconService,
    PluginService,
    ServiceService, SysConfigService,
    SocketCommunicationService,
    TicketService, TranslationService,
    UserService,
    ValidObjectService,
    WidgetRepositoryService
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

            this.container.bind<Server>('Server').to(Server);
            this.initialized = true;
        }
    }

    private bindServices(): void {
        this.container.bind<IAuthenticationService>('IAuthenticationService').to(AuthenticationService);
        this.container.bind<IClientRegistrationService>('IClientRegistrationService').to(ClientRegistrationService);
        this.container.bind<IConfigurationService>('IConfigurationService').to(ConfigurationService);
        this.container.bind<IContactService>('IContactService').to(ContactService);
        this.container.bind<ICustomerService>('ICustomerService').to(CustomerService);
        this.container.bind<IDynamicFieldService>('IDynamicFieldService').to(DynamicFieldService);
        this.container.bind<IGeneralCatalogService>("IGeneralCatalogService").to(GeneralCatalogService);
        this.container.bind<IHttpService>('IHttpService').to(HttpService);
        this.container.bind<ILinkService>("ILinkService").to(LinkService);
        this.container.bind<ILoggingService>('ILoggingService').to(LoggingService);
        this.container.bind<IMarkoService>('IMarkoService').to(MarkoService);
        this.container.bind<IObjectIconService>('IObjectIconService').to(ObjectIconService);
        this.container.bind<IPluginService>('IPluginService').to(PluginService);
        this.container.bind<IServiceService>('IServiceService').to(ServiceService);
        this.container.bind<ISocketCommunicationService>('ISocketCommunicationService').to(SocketCommunicationService);
        this.container.bind<ISysConfigService>('ISysConfigService').to(SysConfigService);
        this.container.bind<ITicketService>('ITicketService').to(TicketService);
        this.container.bind<ITranslationService>('ITranslationService').to(TranslationService);
        this.container.bind<IUserService>('IUserService').to(UserService);
        this.container.bind<IValidObjectService>('IValidObjectService').to(ValidObjectService);
        this.container.bind<IWidgetRepositoryService>('IWidgetRepositoryService').to(WidgetRepositoryService);
    }

    private async bindRouters(): Promise<void> {
        this.container.bind<IRouter>('IRouter').to(AuthenticationRouter);
        this.container.bind<IRouter>('IRouter').to(ApplicationRouter);

        const pluginService = this.container.get<IPluginService>('IPluginService');
        const routerExtensions = await pluginService.getExtensions<IRouterExtension>(KIXExtensions.ROUTER);

        for (const routerExt of routerExtensions) {
            this.container.bind<IRouter>('IRouter').to(routerExt.getRouterClass());
        }
    }

    private async bindCommunicators(): Promise<void> {
        const pluginService = this.container.get<IPluginService>('IPluginService');
        const communicatorExtensions = await pluginService
            .getExtensions<ICommunicatorExtension>(KIXExtensions.COMMUNICATOR);

        for (const communicator of communicatorExtensions) {
            this.container.bind<ICommunicator>('ICommunicator').to(communicator.getCommunicatorClass());
        }
    }

}

const container = new ServiceContainer();
export { container };
