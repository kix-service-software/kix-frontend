import { inject, injectable } from 'inversify';
import {
    IUserService,
    ICommunicator,
    SocketEvent,
    IServerConfiguration,
    ILoggingService,
    IPluginService,
    IAuthenticationService,
    IConfigurationService,
    ITranslationService
} from "@kix/core";

@injectable()
export abstract class KIXCommunicator implements ICommunicator {

    protected serverConfig: IServerConfiguration;
    protected authenticationService: IAuthenticationService;
    protected loggingService: ILoggingService;
    protected pluginService: IPluginService;
    protected configurationService: IConfigurationService;
    protected userService: IUserService;
    protected translationService: ITranslationService;

    public constructor(
        @inject("IConfigurationService") configurationService: IConfigurationService,
        @inject("IAuthenticationService") authenticationService: IAuthenticationService,
        @inject("ILoggingService") loggingService: ILoggingService,
        @inject("IPluginService") pluginService: IPluginService,
        @inject("IUserService") userService: IUserService,
        @inject("ITranslationService") translationService: ITranslationService
    ) {
        this.configurationService = configurationService;
        this.serverConfig = this.configurationService.getServerConfiguration();
        this.authenticationService = authenticationService;
        this.loggingService = loggingService;
        this.pluginService = pluginService;
        this.userService = userService;
        this.translationService = translationService;
    }

    public abstract registerNamespace(socketIO: SocketIO.Server): void;
}
