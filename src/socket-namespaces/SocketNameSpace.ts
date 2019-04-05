import {
    ProfilingService, AuthenticationService,
} from '../core/services';
import { SocketEvent, ISocketRequest } from '../core/model';
import { ISocketNamespace, SocketResponse } from '../core/common';

export abstract class SocketNameSpace implements ISocketNamespace {

    protected abstract getNamespace(): string;

    protected abstract registerEvents(client: SocketIO.Socket): void;

    protected namespace: SocketIO.Namespace;

    public registerNamespace(server: SocketIO.Server): void {
        this.namespace = server.of('/' + this.getNamespace());
        this.namespace
            .use(AuthenticationService.getInstance().isSocketAuthenticated.bind(AuthenticationService.getInstance()))
            .on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
                this.registerEvents(client);
            });
    }

    protected registerEventHandler<RQ extends ISocketRequest, RS>(
        client: SocketIO.Socket, event: string, handler: (data: RQ) => Promise<SocketResponse<RS>>
    ): void {
        client.on(event, (data: RQ) => {

            // start profiling

            const logData = {};
            for (const key in data as any) {
                if (key !== 'token') {
                    logData[key] = data[key];
                }
            }

            const message = `${this.getNamespace()} / ${event} ${JSON.stringify(logData)}`;
            const profileTaskId = ProfilingService.getInstance().start('SocketIO', message, data);

            handler(data).then((response) => {
                client.emit(response.event, response.data);

                // stop profiling
                ProfilingService.getInstance().stop(profileTaskId, response.data);
            });

        });
    }
}
