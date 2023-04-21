/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ComponentContent } from '../../../../../../base-components/webapp/core/ComponentContent';
import { EventService } from '../../../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../../../base-components/webapp/core/IEventSubscriber';
import { OverlayService } from '../../../../../../base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../../../base-components/webapp/core/OverlayType';
import { PortalNotification } from '../../../../../../portal-notification/model/PortalNotification';
import { PortalNotificationEvent } from '../../../../../../portal-notification/model/PortalNotificationEvent';
import { PortalNotificationType } from '../../../../../../portal-notification/model/PortalNotificationType';
import { PortalNotificationService } from '../../../../../../portal-notification/webapp/core/PortalNotificationService';
import { TranslationService } from '../../../../../../translation/webapp/core/TranslationService';
import { ComponentState } from './ComponentState';
import { BrowserUtil } from '../../../../../../base-components/webapp/core/BrowserUtil';
import { DateTimeUtil } from '../../../../../../base-components/webapp/core/DateTimeUtil';
import { SortUtil } from '../../../../../../../model/SortUtil';
import { DataType } from '../../../../../../../model/DataType';
import { SortOrder } from '../../../../../../../model/SortOrder';

class Component extends AbstractMarkoComponent<ComponentState> {

    private subscriber: IEventSubscriber;
    private createTimes: Map<string, string> = new Map();

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.createTimes = new Map();
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Notifications'
        ]);

        this.prepareNotifications();

        this.subscriber = {
            eventSubscriberId: 'personal-notifications',
            eventPublished: async (): Promise<void> => {
                this.prepareNotifications();
            }
        };

        EventService.getInstance().subscribe(PortalNotificationEvent.NOTIFICATION_PUSHED, this.subscriber);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(PortalNotificationEvent.NOTIFICATION_PUSHED, this.subscriber);
    }

    private async prepareNotifications(): Promise<void> {
        const notifications = await PortalNotificationService.getInstance().getNotifications();

        for (const n of notifications) {
            const dateString = await DateTimeUtil.getLocalDateTimeString(n.createTime);
            this.createTimes.set(n.id, dateString);
        }


        const groupedNotifications: Array<[string, PortalNotification[]]> = [];

        for (const n of notifications) {
            let group = groupedNotifications.find((g) => g[0] === n.group);
            if (!group) {
                group = [n.group, []];
                groupedNotifications.push(group);
            }

            group[1].push(n);
            group[1] = SortUtil.sortObjects(group[1], 'createTime', DataType.DATE_TIME, SortOrder.DOWN);
        }

        let count = 0;
        groupedNotifications.forEach((n) => count += n[1].length);
        this.state.notificationsCount = count;
        this.state.notifications = groupedNotifications;

        if (notifications.some((n) => n.type === PortalNotificationType.IMPORTANT)) {
            this.state.notificationIcon = 'fas fa-exclamation';
            this.state.notificationClass = 'notification-important';
        } else if (notifications.some((n) => n.type === PortalNotificationType.WARNING)) {
            this.state.notificationIcon = 'fas fa-exclamation-triangle';
            this.state.notificationClass = 'notification-warning';
        } else if (notifications.some((n) => n.type === PortalNotificationType.INFO)) {
            this.state.notificationIcon = 'fas fa-info';
            this.state.notificationClass = '';
        } else {
            this.state.notificationIcon = 'fas fa-align-left';
            this.state.notificationClass = '';
        }
    }

    public notificationClicked(notification: PortalNotification, event: any): void {
        OverlayService.getInstance().openOverlay(
            OverlayType.INFO, 'notification-overlay', new ComponentContent('notification-info', { notification }),
            notification.title, notification.icon, false,
            [
                event?.target?.getBoundingClientRect().left + BrowserUtil.getBrowserFontsize() || 0,
                event?.target?.getBoundingClientRect().top || 0
            ],
            null, false
        );
    }

    public getCreateTime(notification: PortalNotification): string {
        return this.createTimes.get(notification.id);
    }

    public isGroupRemovable(group: string): boolean {
        let isRemovable = false;
        const notificationGroup = this.state.notifications.find((n) => n[0] === group);
        if (notificationGroup) {
            isRemovable = notificationGroup[1].some((g) => g.isLocal);
        }
        return isRemovable;
    }

    public removeNotification(notification: PortalNotification, event: any): void {
        event.stopPropagation();
        event.preventDefault();
        PortalNotificationService.getInstance().removeNotification(notification);
    }

    public removeGroup(group: string): void {
        PortalNotificationService.getInstance().removeNotifications([group]);
    }
}

module.exports = Component;
