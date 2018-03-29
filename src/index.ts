import { ServiceContainer, ICommunicator } from '@kix/core/dist/common';
import { Server } from './Server';
import {
    IAuthenticationService,
    IClientRegistrationService, IConfigurationService, IContactService, ICustomerService,
    IDynamicFieldService,
    IGeneralCatalogService,
    IHttpService,
    ILinkService, ILoggingService,
    IMarkoService,
    IObjectIconService,
    IPluginService, IProfilingService,
    IServiceService, ISocketCommunicationService, ISysConfigService,
    ITicketService,
    IUserService,
    IValidObjectService,
    IWidgetRepositoryService,
    ConfigurationService,
    LoggingService,
    SocketCommunicationService,
    WidgetRepositoryService,
    ProfilingService
} from '@kix/core/dist/services';
import {
    ValidObjectService, UserService, SysConfigService,
    ServiceService, ObjectIconService, LinkService, HttpService,
    GeneralCatalogService, DynamicFieldService, CustomerService, ContactService,
    ClientRegistrationService,
    AuthenticationService,
    TicketService
} from '@kix/core/dist/services';
import { IRouter } from '@kix/core/dist/routes';
import { AuthenticationRouter, ApplicationRouter } from './routes';
import { IRouterExtension, KIXExtensions, ICommunicatorExtension } from '@kix/core/dist/extensions';
import {
    MarkoService, PluginService,
} from './services';

process.setMaxListeners(0);

class Startup {

    private server: Server;

    public constructor() {
        this.initApplication();
    }

    private async initApplication(): Promise<void> {
        ServiceContainer.getInstance().configurationDirectory = __dirname + '/../config/';
        ServiceContainer.getInstance().certDirectory = __dirname + '/../cert/';

        this.bindServices();
        await this.bindRouters();
        await this.bindCommunicators();
        ServiceContainer.getInstance().register<Server>('Server', Server);
        this.server = ServiceContainer.getInstance().getClass<Server>('Server');
    }

    private bindServices(): void {
        const container = ServiceContainer.getInstance();
        container.register<IAuthenticationService>('IAuthenticationService', AuthenticationService);
        container.register<IClientRegistrationService>('IClientRegistrationService', ClientRegistrationService);
        container.register<IConfigurationService>('IConfigurationService', ConfigurationService);
        container.register<IContactService>('IContactService', ContactService);
        container.register<ICustomerService>('ICustomerService', CustomerService);
        container.register<IDynamicFieldService>('IDynamicFieldService', DynamicFieldService);
        container.register<IGeneralCatalogService>('IGeneralCatalogService', GeneralCatalogService);
        container.register<IHttpService>('IHttpService', HttpService);
        container.register<ILinkService>('ILinkService', LinkService);
        container.register<ILoggingService>('ILoggingService', LoggingService);
        container.register<IMarkoService>('IMarkoService', MarkoService);
        container.register<IObjectIconService>('IObjectIconService', ObjectIconService);
        container.register<IPluginService>('IPluginService', PluginService);
        container.register<IServiceService>('IServiceService', ServiceService);
        container.register<ISocketCommunicationService>('ISocketCommunicationService', SocketCommunicationService);
        container.register<ISysConfigService>('ISysConfigService', SysConfigService);
        container.register<ITicketService>('ITicketService', TicketService);
        container.register<IUserService>('IUserService', UserService);
        container.register<IValidObjectService>('IValidObjectService', ValidObjectService);
        container.register<IWidgetRepositoryService>('IWidgetRepositoryService', WidgetRepositoryService);
        container.register<IProfilingService>('IProfilingService', ProfilingService);
    }

    private async bindRouters(): Promise<void> {
        ServiceContainer.getInstance().register<IRouter>('IRouter', AuthenticationRouter);
        ServiceContainer.getInstance().register<IRouter>('IRouter', ApplicationRouter);

        const pluginService = ServiceContainer.getInstance().getClass<IPluginService>('IPluginService');
        const routerExtensions = await pluginService.getExtensions<IRouterExtension>(KIXExtensions.ROUTER);

        for (const routerExt of routerExtensions) {
            ServiceContainer.getInstance().register<IRouter>('IRouter', routerExt.getRouterClass());
        }
    }

    private async bindCommunicators(): Promise<void> {
        const pluginService = ServiceContainer.getInstance().getClass<IPluginService>('IPluginService');
        const communicatorExtensions = await pluginService
            .getExtensions<ICommunicatorExtension>(KIXExtensions.COMMUNICATOR);

        const container = ServiceContainer.getInstance();
        for (const communicator of communicatorExtensions) {
            container.register<ICommunicator>('ICommunicator', communicator.getCommunicatorClass());
        }
    }

}
const startup = new Startup();
