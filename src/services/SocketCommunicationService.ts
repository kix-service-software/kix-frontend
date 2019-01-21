import https = require('https');
import http = require('http');
import { PluginService } from './PluginService';
import { KIXExtensions, ICommunicatorRegistryExtension } from '../core/extensions';

export class SocketCommunicationService {

    private static INSTANCE: SocketCommunicationService;

    public static getInstance(): SocketCommunicationService {
        if (!SocketCommunicationService.INSTANCE) {
            SocketCommunicationService.INSTANCE = new SocketCommunicationService();
        }
        return SocketCommunicationService.INSTANCE;
    }

    private constructor() { }

    private socketIO: SocketIO.Server;

    public initCache(): Promise<void> {
        return;
    }

    public async initialize(server: https.Server | http.Server): Promise<void> {
        this.socketIO = require('socket.io')(server);
        await this.registerListener();
    }

    public stopServer(): void {
        this.socketIO.close();
    }

    private async registerListener(): Promise<void> {
        const registries = await PluginService.getInstance().getExtensions<ICommunicatorRegistryExtension>(
            KIXExtensions.COMMUNICATOR
        );

        registries.forEach((r) => {
            r.getCommunicatorClasses().forEach((c) => c.registerNamespace(this.socketIO));
        });
    }
}
