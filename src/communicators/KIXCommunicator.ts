import { IUserService } from './../services/IUserService';
import { inject, injectable } from 'inversify';
import { ICommunicator } from './ICommunicator';
import { SocketEvent } from "../model/client/socket/SocketEvent";
import { ILoggingService, IPluginService, IAuthenticationService, IConfigurationService } from "../services/";
import { IServerConfiguration } from "../model/";

@injectable()
export abstract class KIXCommunicator implements ICommunicator {

    protected serverConfig: IServerConfiguration;
    protected authenticationService: IAuthenticationService;
    protected loggingService: ILoggingService;
    protected pluginService: IPluginService;
    protected configurationService: IConfigurationService;
    protected userService: IUserService;

    public constructor(
        @inject("IConfigurationService") configurationService: IConfigurationService,
        @inject("IAuthenticationService") authenticationService: IAuthenticationService,
        @inject("ILoggingService") loggingService: ILoggingService,
        @inject("IPluginService") pluginService: IPluginService,
        @inject("IUserService") userService: IUserService
    ) {
        this.configurationService = configurationService;
        this.serverConfig = this.configurationService.getServerConfiguration();
        this.authenticationService = authenticationService;
        this.loggingService = loggingService;
        this.pluginService = pluginService;
        this.userService = userService;
    }

    public abstract registerNamespace(socketIO: SocketIO.Server): void;
}
