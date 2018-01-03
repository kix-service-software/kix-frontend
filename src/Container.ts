import 'reflect-metadata';

import {
    IArticleTypeService,
    IAuthenticationService,
    IConfigurationService,
    IContactService,
    ICustomerService,
    IDynamicFieldService,
    IGroupService,
    IHttpService,
    ILoggingService,
    IMarkoService,
    IPluginService,
    IQueueService,
    IRoleService,
    ISocketCommunicationService,
    IServiceService,
    ISignatureService,
    ITicketPriorityService,
    ITicketService,
    ITicketStateService,
    ITicketTypeService,
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
    ArticleTypeService,
    AuthenticationService,
    ConfigurationService,
    ContactService,
    CustomerService,
    DynamicFieldService,
    GroupService,
    HttpService,
    LoggingService,
    MarkoService,
    PluginService,
    QueueService,
    RoleService,
    SocketCommunicationService,
    ServiceService,
    SignatureService,
    TicketPriorityService,
    TicketService,
    TicketStateService,
    TicketTypeService,
    TranslationService,
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
        this.container.bind<ILoggingService>('ILoggingService').to(LoggingService);
        this.container.bind<IConfigurationService>('IConfigurationService').to(ConfigurationService);
        this.container.bind<IPluginService>('IPluginService').to(PluginService);
        this.container.bind<ISocketCommunicationService>('ISocketCommunicationService').to(SocketCommunicationService);
        this.container.bind<IMarkoService>('IMarkoService').to(MarkoService);
        this.container.bind<IHttpService>('IHttpService').to(HttpService);
        this.container.bind<IAuthenticationService>('IAuthenticationService').to(AuthenticationService);
        this.container.bind<IUserService>('IUserService').to(UserService);
        this.container.bind<ITicketTypeService>('ITicketTypeService').to(TicketTypeService);
        this.container.bind<ITicketService>('ITicketService').to(TicketService);
        this.container.bind<ITicketPriorityService>('ITicketPriorityService').to(TicketPriorityService);
        this.container.bind<IValidObjectService>('IValidObjectService').to(ValidObjectService);
        this.container.bind<ITicketStateService>('ITicketStateService').to(TicketStateService);
        this.container.bind<ITranslationService>('ITranslationService').to(TranslationService);
        this.container.bind<IGroupService>('IGroupService').to(GroupService);
        this.container.bind<IArticleTypeService>('IArticleTypeService').to(ArticleTypeService);
        this.container.bind<IRoleService>('IRoleService').to(RoleService);
        this.container.bind<IQueueService>('IQueueService').to(QueueService);
        this.container.bind<IServiceService>('IServiceService').to(ServiceService);
        this.container.bind<IWidgetRepositoryService>('IWidgetRepositoryService').to(WidgetRepositoryService);
        this.container.bind<IDynamicFieldService>('IDynamicFieldService').to(DynamicFieldService);
        this.container.bind<ICustomerService>('ICustomerService').to(CustomerService);
        this.container.bind<IContactService>('IContactService').to(ContactService);
        this.container.bind<ISignatureService>('ISignatureService').to(SignatureService);
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
