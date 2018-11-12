import {
    ProfilingService, AuthenticationService,
} from '@kix/core/dist/services';
import { SocketEvent, ISocketRequest } from '@kix/core/dist/model';
import { ICommunicator, CommunicatorResponse } from '@kix/core/dist/common';

export abstract class KIXCommunicator implements ICommunicator {

    protected abstract getNamespace(): string;

    protected abstract registerEvents(client: SocketIO.Socket): void;

    public registerNamespace(server: SocketIO.Server): void {
        const nsp = server.of('/' + this.getNamespace());
        nsp
            .use(AuthenticationService.getInstance().isSocketAuthenticated.bind(AuthenticationService.getInstance()))
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
            const profileTaskId = ProfilingService.getInstance().start('SocketIO', message, data);

            const response: CommunicatorResponse<RS> = await handler(data);
            client.emit(response.event, response.data);

            // stop profiling
            ProfilingService.getInstance().stop(profileTaskId, response.data);
        });
    }
}
