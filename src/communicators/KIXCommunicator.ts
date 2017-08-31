import { inject, injectable } from 'inversify';
import { ICommunicator } from './ICommunicator';
import { SocketEvent } from "../model-client/index";
import { ILoggingService, IPluginService, IAuthenticationService, IConfigurationService } from "../services/index";
import { IServerConfiguration } from "../model/index";

@injectable()
export abstract class KIXCommunicator implements ICommunicator {

    protected serverConfig: IServerConfiguration;
    protected authenticationService: IAuthenticationService;
    protected loggingService: ILoggingService;
    protected pluginService: IPluginService;

    public constructor(
        @inject("IConfigurationService") configurationService: IConfigurationService,
        @inject("IAuthenticationService") authenticationService: IAuthenticationService,
        @inject("ILoggingService") loggingService: ILoggingService,
        @inject("IPluginService") pluginService: IPluginService
    ) {
        this.serverConfig = configurationService.getServerConfiguration();
        this.authenticationService = authenticationService;
        this.loggingService = loggingService;
        this.pluginService = pluginService;
    }

    public abstract registerNamespace(socketIO: SocketIO.Server): void;
}
