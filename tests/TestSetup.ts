import { ServiceContainer, IService } from "@kix/core/dist/common";
import {
    IMarkoService,
    IPluginService,
    IConfigurationService,
    ISocketCommunicationService,
    IWidgetRepositoryService,
    SocketCommunicationService,
    WidgetRepositoryService,
    ConfigurationService,
    LoggingService,
    ILoggingService,
    ProfilingService,
    IProfilingService
} from "@kix/core/dist/services";

import {
    PluginService, MarkoService,
} from '../src/services';

const container = ServiceContainer.getInstance();
container.configurationDirectory = __dirname + '/../config/';
container.certDirectory = __dirname + '/../cert/';
container.register<IService>('IConfigurationService', ConfigurationService);
container.register<IService>('ILoggingService', LoggingService);
container.register<IService>('IProfilingService', ProfilingService);
container.register<IService>('IMarkoService', MarkoService);
container.register<IService>('IPluginService', PluginService);
container.register<IService>('ISocketCommunicationService', SocketCommunicationService);
