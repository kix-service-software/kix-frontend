/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RequestMethod } from '../../../../server/model/rest/RequestMethod';
import { BackendNotification } from '../../model/BackendNotification';
import { NotificationHandler } from '../../modules/base-components/webapp/core/NotificationHandler';
import { APIClient } from '../APIClient';
import { WindowListener } from '../../modules/base-components/webapp/core/WindowListener';

export class BackendNotificationAPIClient extends APIClient {

    private static abortController: AbortController;
    private static loop: boolean;
    private static hasListener: boolean = false;

    public static async initialize(): Promise<void> {
        BackendNotificationAPIClient.abortController = new AbortController();
        BackendNotificationAPIClient.loop = true;
        if (!BackendNotificationAPIClient.hasListener) {
            window.addEventListener('beforeunload', BackendNotificationAPIClient.abort);
            BackendNotificationAPIClient.hasListener = true;
        }
        BackendNotificationAPIClient.waitForNotifications();
    }

    private static async waitForNotifications(): Promise<void> {
        while (BackendNotificationAPIClient.loop) {
            try {
                const response = await this.executeRequest(
                    RequestMethod.GET, '/notifications/backend', null, null, null,
                    BackendNotificationAPIClient.abortController
                );
                const result = await response?.json();
                const notifications = (result.notifications || []).map(((n) => new BackendNotification(n)));
                NotificationHandler.getInstance().handleUpdateNotifications(notifications);
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
        BackendNotificationAPIClient.loop = false;
        BackendNotificationAPIClient.abortController.abort();

        // if user abort the unload, reinitialize after a minute
        setTimeout(() => BackendNotificationAPIClient.initialize(), 60000);
    }
}