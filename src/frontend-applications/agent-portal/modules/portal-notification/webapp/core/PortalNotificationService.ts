/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DataType } from '../../../../model/DataType';
import { SortOrder } from '../../../../model/SortOrder';
import { SortUtil } from '../../../../model/SortUtil';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../base-components/webapp/core/IEventSubscriber';
import { PortalNotification } from '../../model/PortalNotification';
import { PortalNotificationEvent } from '../../model/PortalNotificationEvent';
import { PortalNotificationSocketClient } from './PortalNotificationSocketClient';

export class PortalNotificationService {

    private static INSTANCE: PortalNotificationService;

    public static getInstance(): PortalNotificationService {
        if (!PortalNotificationService.INSTANCE) {
            PortalNotificationService.INSTANCE = new PortalNotificationService();
        }
        return PortalNotificationService.INSTANCE;
    }

    private constructor() {
        const subscriber: IEventSubscriber = {
            eventSubscriberId: 'PortalNotificationService',
            eventPublished: () => this.loadNotifications()
        };
        PortalNotificationSocketClient.getInstance();
        EventService.getInstance().subscribe(PortalNotificationEvent.NOTIFICATIONS_UPDATED, subscriber);
    }

    private notifications: PortalNotification[] = null;

    public publishNotifications(notifications: PortalNotification[], removeGroupNotifications: string[] = []): void {
        this.notifications = this.notifications?.filter((n) => !removeGroupNotifications.some((g) => g === n.group));
        this.notifications?.push(...notifications);
        this.notifications = SortUtil.sortObjects(
            this.notifications, 'createTime', DataType.DATE_TIME, SortOrder.DOWN
        );

        EventService.getInstance().publish(PortalNotificationEvent.NOTIFICATION_PUSHED);
    }

    public removeNotification(notification: PortalNotification): void {
        const index = this.notifications?.findIndex((n) => n.id === notification.id);
        if (index !== -1) {
            this.notifications?.splice(index, 1);
        }
        EventService.getInstance().publish(PortalNotificationEvent.NOTIFICATION_PUSHED);
    }

    public removeNotifications(groups: string[] = []): void {
        this.notifications = this.notifications?.filter((n) => !groups.some((g) => g === n.group));
        EventService.getInstance().publish(PortalNotificationEvent.NOTIFICATION_PUSHED);
    }

    public async getNotifications(): Promise<PortalNotification[]> {
        if (!this.notifications) {
            this.notifications = [];
            await this.loadNotifications();
        }
        return this.notifications;
    }

    public getPreLoginNotifications(): Promise<PortalNotification[]> {
        return PortalNotificationSocketClient.getInstance().loadPreLoginNotifications();
    }

    private async loadNotifications(): Promise<void> {
        const serverNotifications = await PortalNotificationSocketClient.getInstance().loadNotifications();
        const groupMap: Map<string, PortalNotification[]> = new Map();
        serverNotifications.forEach((n) => {
            if (!groupMap.has(n.group)) {
                groupMap.set(n.group, []);
            }

            groupMap.get(n.group).push(n);
        });


        if (groupMap.size === 0) {
            this.publishNotifications([], ['news']);
        } else {
            groupMap.forEach((notifications, group) => {
                this.publishNotifications(notifications, [group]);
            });
        }
    }

}