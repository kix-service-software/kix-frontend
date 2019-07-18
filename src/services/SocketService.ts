/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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
