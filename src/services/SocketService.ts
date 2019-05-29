import https = require('https');
import http = require('http');
import { PluginService } from './PluginService';
import { KIXExtensions, ISocketNamespaceRegistryExtension } from '../core/extensions';
import { NotificationNamespace } from '../socket-namespaces';
import { ObjectUpdatedEventData } from '../core/model';

export class SocketService {

    private static INSTANCE: SocketService;

    public static getInstance(): SocketService {
        if (!SocketService.INSTANCE) {
            SocketService.INSTANCE = new SocketService();
        }
        return SocketService.INSTANCE;
    }

    private constructor() { }

    private socketIO: SocketIO.Server;

    public async initialize(server: https.Server | http.Server): Promise<void> {
        this.socketIO = require('socket.io')(server);
        await this.registerNamespaces();
    }

    public stopServer(): void {
        this.socketIO.close();
    }

    private async registerNamespaces(): Promise<void> {
        const registries = await PluginService.getInstance().getExtensions<ISocketNamespaceRegistryExtension>(
            KIXExtensions.SOCKET_NAMESPACE
        );

        registries.forEach((r) => {
            r.getNamespaceClasses().forEach((c) => c.registerNamespace(this.socketIO));
        });
    }

    public broadcast(events: ObjectUpdatedEventData[]): void {
        NotificationNamespace.getInstance().broadcast(events);
    }
}
