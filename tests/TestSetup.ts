import { ServiceContainer } from "@kix/core/dist/common";
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
container.register<IConfigurationService>('IConfigurationService', ConfigurationService);
container.register<ILoggingService>('ILoggingService', LoggingService);
container.register<IProfilingService>('IProfilingService', ProfilingService);
container.register<IMarkoService>('IMarkoService', MarkoService);
container.register<IPluginService>('IPluginService', PluginService);
container.register<ISocketCommunicationService>('ISocketCommunicationService', SocketCommunicationService);
container.register<IWidgetRepositoryService>('IWidgetRepositoryService', WidgetRepositoryService);
