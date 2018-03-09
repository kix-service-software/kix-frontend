import 'reflect-metadata';

import {
    IAuthenticationService,
    IClientRegistrationService, IConfigurationService, IContactService, ICustomerService,
    IDynamicFieldService,
    IGeneralCatalogService, IGroupService,
    IHttpService,
    ILinkService, ILoggingService,
    IMailAccountService, IMarkoService,
    IObjectIconService,
    IPluginService,
    IRoleService,
    ISalutationService, ISearchProfileService, IServiceService, ISignatureService, ISysConfigService,
    ISocketCommunicationService, IStandardAttachmentService,
    ITextModuleService, ITicketService,
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
    GeneralCatalogService, GroupService,
    HttpService,
    LinkService, LoggingService,
    MailAccountService, MarkoService,
    ObjectIconService,
    PluginService,
    RoleService,
    SalutationService, SearchProfileService, ServiceService, SignatureService, SysConfigService,
    StandardAttachmentService, SocketCommunicationService,
    TextModuleService, TicketService, TranslationService,
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
        this.container.bind<IGroupService>('IGroupService').to(GroupService);
        this.container.bind<IHttpService>('IHttpService').to(HttpService);
        this.container.bind<ILinkService>("ILinkService").to(LinkService);
        this.container.bind<ILoggingService>('ILoggingService').to(LoggingService);
        this.container.bind<IMailAccountService>("IMailAccountService").to(MailAccountService);
        this.container.bind<IMarkoService>('IMarkoService').to(MarkoService);
        this.container.bind<IObjectIconService>('IObjectIconService').to(ObjectIconService);
        this.container.bind<IPluginService>('IPluginService').to(PluginService);
        this.container.bind<IRoleService>('IRoleService').to(RoleService);
        this.container.bind<ISalutationService>('ISalutationService').to(SalutationService);
        this.container.bind<ISearchProfileService>('ISearchProfileService').to(SearchProfileService);
        this.container.bind<IServiceService>('IServiceService').to(ServiceService);
        this.container.bind<ISignatureService>('ISignatureService').to(SignatureService);
        this.container.bind<ISocketCommunicationService>('ISocketCommunicationService').to(SocketCommunicationService);
        this.container.bind<IStandardAttachmentService>('IStandardAttachmentService').to(StandardAttachmentService);
        this.container.bind<ISysConfigService>('ISysConfigService').to(SysConfigService);
        this.container.bind<ITextModuleService>('ITextModuleService').to(TextModuleService);
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
