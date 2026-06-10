import { APIClient } from '../../../../api-client/APIClient';
import { ClientStorageService } from '../../../base-components/webapp/core/ClientStorageService';

export class NotificationWorker {

    private static INSTANCE: NotificationWorker;

    public static getInstance(): NotificationWorker {
        if (!NotificationWorker.INSTANCE) {
            NotificationWorker.INSTANCE = new NotificationWorker();
        }
        return NotificationWorker.INSTANCE;
    }

    private constructor() { }

    private workerChannel: BroadcastChannel;

    public init(): void {
        this.workerChannel = new BroadcastChannel('worker-channel');

        try {
            const baseRoute = ClientStorageService.getBaseRoute();
            const workerJS = `${baseRoute}/static/notification-worker.js`;
            new SharedWorker(workerJS);
        } catch (e) {
            console.error(e);
        }

        setTimeout(
            () => this.workerChannel?.postMessage({
                objectEventURL: APIClient.getUrl('/notifications/backend'),
                portalNotificationURL: APIClient.getUrl('/notifications/portal'),
                application: ClientStorageService.application
            }), 500
        );
    }

    public sendMessage(data: any): void {
        this.workerChannel?.postMessage(data);
    }

}