import { inject, injectable } from 'inversify';
import {
    IAuthenticationService, IConfigurationService, IContactService, ICustomerService, IDynamicFieldService,
    IGeneralCatalogService, ILoggingService, IObjectIconService, IPluginService, IServiceService, ISysConfigService,
    ITicketService, IUserService, IProfilingService, IMarkoService, ITextModuleService,
} from '@kix/core/dist/services';
import { SocketEvent, ISocketRequest, ISocketObjectRequest } from '@kix/core/dist/model';
import { ICommunicator, CommunicatorResponse } from '@kix/core/dist/common';

@injectable()
export abstract class KIXCommunicator implements ICommunicator {

    public constructor(
        @inject('IConfigurationService') protected configurationService: IConfigurationService,
        @inject('IAuthenticationService') protected authenticationService: IAuthenticationService,
        @inject('ILoggingService') protected loggingService: ILoggingService,
        @inject('IPluginService') protected pluginService: IPluginService,
        @inject('IUserService') protected userService: IUserService,
        @inject('ICustomerService') protected customerService: ICustomerService,
        @inject('IContactService') protected contactService: IContactService,
        @inject('ITicketService') protected ticketService: ITicketService,
        @inject('IServiceService') protected serviceService: IServiceService,
        @inject('IDynamicFieldService') protected dynamicFieldService: IDynamicFieldService,
        @inject('ISysConfigService') protected sysConfigService: ISysConfigService,
        @inject('IObjectIconService') protected objectIconService: IObjectIconService,
        @inject('IGeneralCatalogService') protected generalCatalogService: IGeneralCatalogService,
        @inject('IProfilingService') protected profilingService: IProfilingService,
        @inject('ITextModuleService') protected textmoduleService: ITextModuleService,
        @inject('IMarkoService') protected markoService: IMarkoService
    ) { }

    protected abstract getNamespace(): string;

    protected abstract registerEvents(client: SocketIO.Socket): void;

    public registerNamespace(server: SocketIO.Server): void {
        const nsp = server.of('/' + this.getNamespace());
        nsp
            .use(this.authenticationService.isSocketAuthenticated.bind(this.authenticationService))
            .on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
                this.registerEvents(client);
            });
    }

    protected registerEventHandler<RQ extends ISocketRequest, RS>(
        client: SocketIO.Socket, event: string, handler: (data: RQ) => Promise<CommunicatorResponse<RS>>
    ): void {
        client.on(event, async (data: RQ) => {

            // start profiling

            let object = "";
            if (object['objectType']) {
                object = `(${data['objectType']})`;
            }

            const message = `${this.getNamespace()} / ${event} ${object}`;
            const profileTaskId = this.profilingService.start('SocketIO', message, data);

            const response: CommunicatorResponse<RS> = await handler(data);
            client.emit(response.event, response.data);

            // stop profiling
            this.profilingService.stop(profileTaskId, response.data);
        });
    }
}
