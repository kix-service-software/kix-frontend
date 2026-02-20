import { RequestMethod } from '../../../../server/model/rest/RequestMethod';
import { EventService } from '../../modules/base-components/webapp/core/EventService';
import { APIClient } from '../APIClient';
import { WindowListener } from '../../modules/base-components/webapp/core/WindowListener';

export class PortalNotificationAPIClient extends APIClient {

    private static abortController: AbortController;
    private static loop: boolean;
    private static hasListener: boolean = false;

    public static async initialize(): Promise<void> {
        PortalNotificationAPIClient.abortController = new AbortController();
        PortalNotificationAPIClient.loop = true;
        if (!PortalNotificationAPIClient.hasListener) {
            window.addEventListener('beforeunload', PortalNotificationAPIClient.abort);
            PortalNotificationAPIClient.hasListener = true;
        }
        PortalNotificationAPIClient.waitForNotifications();
    }

    private static async waitForNotifications(): Promise<void> {
        while (PortalNotificationAPIClient.loop) {
            try {
                const response = await this.executeRequest(
                    RequestMethod.GET, '/notifications/portal', null, null, null,
                    PortalNotificationAPIClient.abortController
                );
                const result = await response.json();
                EventService.getInstance().publish(result?.event);
            } catch (e) {
                if (e.name !== 'AbortError') {
                    console.error(e);
                    await this.timeout();
                }
            }
        }
    }

    private static timeout(): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(), 10000);
        });
    }

    private static abort(): void {
        PortalNotificationAPIClient.loop = false;
        PortalNotificationAPIClient.abortController.abort();

        // if user abort the unload, reinitialize after a minute
        setTimeout(() => PortalNotificationAPIClient.initialize(), 60000);
    }

}