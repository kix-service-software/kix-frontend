/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { NotificationEvent } from '../../model/NotificationEvent';
import { NotificationNamespace } from '../socket-namespaces/NotificationNamespace';
import { AgentPortalExtensions } from '../extensions/AgentPortalExtensions';
import { PluginService } from '../../../../server/services/PluginService';
import { ISocketNamespaceRegistryExtension } from '../extensions/ISocketNamespaceRegistryExtension';
import { LoggingService } from '../../../../server/services/LoggingService';
import { Server } from 'socket.io';

export class SocketService {

    private static INSTANCE: SocketService;

    private namespaces = [];

    public static getInstance(): SocketService {
        if (!SocketService.INSTANCE) {
            SocketService.INSTANCE = new SocketService();
        }
        return SocketService.INSTANCE;
    }

    private constructor() { }

    private socketIO: Server;

    public async initialize(socketIO: any): Promise<void> {
        this.socketIO = socketIO;
        await this.registerNamespaces();
    }

    public stopServer(): void {
        this.socketIO.close();
    }

    private async registerNamespaces(): Promise<void> {
        const namespaces = await PluginService.getInstance().getExtensions<ISocketNamespaceRegistryExtension>(
            AgentPortalExtensions.SOCKET_NAMESPACE
        );

        for (const namespace of namespaces) {
            for (const c of namespace.getNamespaceClasses()) {
                LoggingService.getInstance().info(`Register socket namespace: ${c.constructor.name}`);
                this.namespaces.push(c);
                await c.registerNamespace(this.socketIO);
            }
        }
    }

    public broadcast(event: NotificationEvent, data: any): void {
        NotificationNamespace.getInstance().broadcast(event, data);
    }

}
