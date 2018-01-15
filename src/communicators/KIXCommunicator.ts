import { inject, injectable } from 'inversify';
import {
    IUserService,
    ILoggingService,
    IPluginService,
    IAuthenticationService,
    IConfigurationService,
    IQueueService,
    IServiceService,
    ITranslationService,
    ITicketService,
    ITicketStateService,
    ITicketTypeService,
    ITicketPriorityService,
    IWidgetRepositoryService,
    ICustomerService,
    IContactService
} from "@kix/core/dist/services";
import { SocketEvent } from '@kix/core/dist/model';
import { ICommunicator, IServerConfiguration } from '@kix/core/dist/common';

@injectable()
export abstract class KIXCommunicator implements ICommunicator {

    public constructor(
        @inject("IConfigurationService") protected configurationService: IConfigurationService,
        @inject("IAuthenticationService") protected authenticationService: IAuthenticationService,
        @inject("ILoggingService") protected loggingService: ILoggingService,
        @inject("IPluginService") protected pluginService: IPluginService,
        @inject("IUserService") protected userService: IUserService,
        @inject("ICustomerService") protected customerService: ICustomerService,
        @inject("IContactService") protected contactService: IContactService,
        @inject("ITranslationService") protected translationService: ITranslationService,
        @inject("ITicketService") protected ticketService: ITicketService,
        @inject("ITicketStateService") protected ticketStateService: ITicketStateService,
        @inject("ITicketTypeService") protected ticketTypeService: ITicketTypeService,
        @inject("ITicketPriorityService") protected ticketPriorityService: ITicketPriorityService,
        @inject("IQueueService") protected queueService: IQueueService,
        @inject("IServiceService") protected serviceService: IServiceService,
        @inject("IWidgetRepositoryService") protected widgetRepositoryService: IWidgetRepositoryService
    ) { }

    public abstract registerNamespace(socketIO: SocketIO.Server): void;
}
