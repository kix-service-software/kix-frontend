/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Server, Socket } from 'socket.io';
import { SocketNameSpace } from '../../../server/socket-namespaces/SocketNameSpace';
import { SocketErrorResponse } from '../../base-components/webapp/core/SocketErrorResponse';
import { SocketEvent } from '../../base-components/webapp/core/SocketEvent';
import { SocketResponse } from '../../base-components/webapp/core/SocketResponse';
import { PortalNotificationEvent } from '../model/PortalNotificationEvent';
import { PortalNotificationService } from './PortalNotificationService';

export class PortalNotificationNamespace extends SocketNameSpace {

    private static INSTANCE: PortalNotificationNamespace;

    public static getInstance(): PortalNotificationNamespace {
        if (!PortalNotificationNamespace.INSTANCE) {
            PortalNotificationNamespace.INSTANCE = new PortalNotificationNamespace();
        }
        return PortalNotificationNamespace.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'portal-notifications';
    }

    public registerNamespace(socketIO: Server): void {
        this.namespace = socketIO.of('/' + this.getNamespace());
        this.namespace.on(SocketEvent.CONNECTION, (client: Socket) => {
            this.registerEvents(client);
        });
    }

    public broadcastUpdate(preLogin?: boolean): void {
        if (this.namespace) {
            const event = preLogin
                ? PortalNotificationEvent.PRE_LOGIN_NOTIFICATIONS_UPDATED
                : PortalNotificationEvent.NOTIFICATIONS_UPDATED;
            this.namespace.emit(event);
        }
    }

    protected registerEvents(client: Socket): void {
        this.registerEventHandler(
            client, PortalNotificationEvent.GET_PRELOGIN_NOTIFICATIONS,
            this.getPreLoginNotifications.bind(this)
        );

        this.registerEventHandler(
            client, PortalNotificationEvent.GET_NOTIFICATIONS,
            this.getNotifications.bind(this)
        );
    }

    protected async getPreLoginNotifications(
        data: any, client: Socket
    ): Promise<SocketResponse<any | SocketErrorResponse>> {
        const notifications = PortalNotificationService.getInstance().getPreLoginNotifications(data.userType) || [];
        const response = { requestId: data.requestId, notifications };
        return new SocketResponse(PortalNotificationEvent.GET_PRELOGIN_NOTIFICATIONS_FINISHED, response);
    }

    protected async getNotifications(
        data: any, client: Socket
    ): Promise<SocketResponse<any | SocketErrorResponse>> {
        const notifications = PortalNotificationService.getInstance().getNotifications(data.userType) || [];
        const response = { requestId: data.requestId, notifications };
        return new SocketResponse(PortalNotificationEvent.GET_NOTIFICATIONS_FINISHED, response);
    }

}
