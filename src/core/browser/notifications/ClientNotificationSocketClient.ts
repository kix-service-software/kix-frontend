import { SocketClient } from '../SocketClient';
import { NotificationEvent, ObjectUpdatedEventData } from '../../model';
import { CacheService } from '../cache';
import { ClientStorageService } from '../ClientStorageService';
import { ContextService } from '../context';

export class ClientNotificationSocketClient extends SocketClient {

    private notificationsSocket: SocketIO.Server;

    private static INSTANCE: ClientNotificationSocketClient = null;

    public static getInstance(): ClientNotificationSocketClient {
        if (!ClientNotificationSocketClient.INSTANCE) {
            ClientNotificationSocketClient.INSTANCE = new ClientNotificationSocketClient();
        }

        return ClientNotificationSocketClient.INSTANCE;
    }

    public constructor() {
        super();
        this.notificationsSocket = this.createSocket('notifications');

        this.notificationsSocket.on(
            NotificationEvent.MESSAGE, (events: ObjectUpdatedEventData[]) => {
                CacheService.getInstance().updateCaches(events);
                events = events.filter((e) => e.RequestID !== ClientStorageService.getClientRequestId());
                ContextService.getInstance().handleUpdateNotifications(events);
            });
    }

}
