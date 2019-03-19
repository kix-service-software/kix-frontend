import { SocketClient } from '../SocketClient';
import { NotificationEvent, ObjectUpdatedEventData } from '../../model';
import { CacheService } from '../cache';
import { ClientStorageService } from '../ClientStorageService';
import { ContextService } from '../context';

export class NotificationSocketClient extends SocketClient {

    private notificationsSocket: SocketIO.Server;

    private static INSTANCE: NotificationSocketClient = null;

    public static getInstance(): NotificationSocketClient {
        if (!NotificationSocketClient.INSTANCE) {
            NotificationSocketClient.INSTANCE = new NotificationSocketClient();
        }

        return NotificationSocketClient.INSTANCE;
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
