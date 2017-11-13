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
    IQueueService,
    ITranslationService,
    ITicketService,
    ITicketStateService,
    ITicketTypeService,
    ITicketPriorityService
} from "@kix/core";

@injectable()
export abstract class KIXCommunicator implements ICommunicator {

    public constructor(
        @inject("IConfigurationService") protected configurationService: IConfigurationService,
        @inject("IAuthenticationService") protected authenticationService: IAuthenticationService,
        @inject("ILoggingService") protected loggingService: ILoggingService,
        @inject("IPluginService") protected pluginService: IPluginService,
        @inject("IUserService") protected userService: IUserService,
        @inject("ITranslationService") protected translationService: ITranslationService,
        @inject("ITicketService") protected ticketService: ITicketService,
        @inject("ITicketStateService") protected ticketStateService: ITicketStateService,
        @inject("ITicketTypeService") protected ticketTypeService: ITicketTypeService,
        @inject("ITicketPriorityService") protected ticketPriorityService: ITicketPriorityService,
        @inject("IQueueService") protected queueService: IQueueService
    ) { }

    public abstract registerNamespace(socketIO: SocketIO.Server): void;
}
