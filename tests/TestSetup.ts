import { ServiceContainer } from "@kix/core/dist/common";
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
    IWidgetRepositoryService
} from "@kix/core/dist/services";

import {
    ProfilingService, ValidObjectService, UserService, SysConfigService, SocketCommunicationService,
    ServiceService, PluginService, ObjectIconService, MarkoService, LoggingService, LinkService, HttpService,
    GeneralCatalogService, DynamicFieldService, CustomerService, ContactService, ConfigurationService,
    ClientRegistrationService,
    WidgetRepositoryService,
    AuthenticationService,
    TicketService
} from '../src/services';

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
