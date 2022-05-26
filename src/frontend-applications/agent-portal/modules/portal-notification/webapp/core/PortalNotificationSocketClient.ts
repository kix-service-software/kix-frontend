/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../model/IdService';
import { ClientStorageService } from '../../../base-components/webapp/core/ClientStorageService';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { SocketClient } from '../../../base-components/webapp/core/SocketClient';
import { SocketErrorResponse } from '../../../base-components/webapp/core/SocketErrorResponse';
import { SocketEvent } from '../../../base-components/webapp/core/SocketEvent';
import { PortalNotification } from '../../model/PortalNotification';
import { PortalNotificationEvent } from '../../model/PortalNotificationEvent';

export class PortalNotificationSocketClient extends SocketClient {

    public static getInstance(): PortalNotificationSocketClient {
        if (!PortalNotificationSocketClient.INSTANCE) {
            PortalNotificationSocketClient.INSTANCE = new PortalNotificationSocketClient();
        }

        return PortalNotificationSocketClient.INSTANCE;
    }

    private static INSTANCE: PortalNotificationSocketClient = null;

    private constructor() {
        super('portal-notifications');

        this.socket.on(
            PortalNotificationEvent.PRE_LOGIN_NOTIFICATIONS_UPDATED, () => {
                EventService.getInstance().publish(PortalNotificationEvent.PRE_LOGIN_NOTIFICATIONS_UPDATED);
            }
        );

        this.socket.on(
            PortalNotificationEvent.NOTIFICATIONS_UPDATED, () => {
                EventService.getInstance().publish(PortalNotificationEvent.NOTIFICATIONS_UPDATED);
            }
        );
    }

    public async loadPreLoginNotifications(): Promise<PortalNotification[]> {
        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<PortalNotification[]>((resolve, reject) => {

            const requestId = IdService.generateDateBasedId();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + PortalNotificationEvent.GET_PRELOGIN_NOTIFICATIONS);
            }, socketTimeout);

            this.socket.on(PortalNotificationEvent.GET_PRELOGIN_NOTIFICATIONS_FINISHED,
                (result: any) => {
                    if (result.requestId === requestId) {
                        window.clearTimeout(timeout);
                        resolve(result.notifications || []);
                    }
                }
            );

            this.socket.emit(
                PortalNotificationEvent.GET_PRELOGIN_NOTIFICATIONS, { requestId }
            );

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });
        });
    }

    public async loadNotifications(): Promise<PortalNotification[]> {
        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<PortalNotification[]>((resolve, reject) => {

            const requestId = IdService.generateDateBasedId();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + PortalNotificationEvent.GET_NOTIFICATIONS);
            }, socketTimeout);

            this.socket.on(PortalNotificationEvent.GET_NOTIFICATIONS_FINISHED,
                (result: any) => {
                    if (result.requestId === requestId) {
                        window.clearTimeout(timeout);
                        resolve(result.notifications || []);
                    }
                }
            );

            this.socket.emit(
                PortalNotificationEvent.GET_NOTIFICATIONS, { requestId }
            );

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });
        });
    }
}