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
import { ServerManager } from '../../../../server/ServerManager';

export class SocketService {

    private namespaces = [];

    public constructor(private socketIO: Server) { }

    public async initialize(): Promise<void> {
        const namespaces = await PluginService.getInstance().getExtensions<ISocketNamespaceRegistryExtension>(
            AgentPortalExtensions.SOCKET_NAMESPACE
        );

        for (const namespace of namespaces) {
            for (const c of namespace.getNamespaceClasses()) {
                LoggingService.getInstance().info(`Register socket namespace: ${c.constructor.name}`);
                this.namespaces.push(c);
                c.registerNamespace(this.socketIO);
            }
        }
    }

    public stopServer(): void {
        this.socketIO.close();
    }

    public broadcast(event: NotificationEvent, data: any): void {
        const notificationNamespace: NotificationNamespace = this.namespaces.find(
            (n) => n instanceof NotificationNamespace
        );
        notificationNamespace?.broadcast(event, data);
    }

}
