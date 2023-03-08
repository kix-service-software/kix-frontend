/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DataType } from '../../../model/DataType';
import { SortOrder } from '../../../model/SortOrder';
import { SortUtil } from '../../../model/SortUtil';
import { UserType } from '../../user/model/UserType';
import { PortalNotification } from '../model/PortalNotification';
import { PortalNotificationNamespace } from './PortalNotificationNamespace';

export class PortalNotificationService {

    private static INSTANCE: PortalNotificationService;

    public static getInstance(): PortalNotificationService {
        if (!PortalNotificationService.INSTANCE) {
            PortalNotificationService.INSTANCE = new PortalNotificationService();
        }
        return PortalNotificationService.INSTANCE;
    }

    private constructor() { }

    private notifications: PortalNotification[] = [];
    private preLoginNotifications: PortalNotification[] = [];

    public publishNotifications(notifications: PortalNotification[], removeGroupNotifications: string[] = []): void {
        this.notifications = this.notifications.filter((n) => !removeGroupNotifications.some((g) => g === n.group));
        this.notifications.push(...notifications);
        this.notifications = SortUtil.sortObjects(
            this.notifications, 'createTime', DataType.DATE_TIME, SortOrder.DOWN
        );
        PortalNotificationNamespace.getInstance().broadcastUpdate();
    }

    public publishPreLoginNotifications(
        notifications: PortalNotification[], removeGroupNotifications: string[] = []
    ): void {
        this.preLoginNotifications = this.preLoginNotifications.filter(
            (n) => !removeGroupNotifications.some((g) => g === n.group)
        );
        this.preLoginNotifications.push(...notifications);

        this.preLoginNotifications = SortUtil.sortObjects(
            this.preLoginNotifications, 'createTime', DataType.DATE_TIME, SortOrder.DOWN
        );
        PortalNotificationNamespace.getInstance().broadcastUpdate(true);
    }

    public getNotifications(userType: UserType = UserType.AGENT): PortalNotification[] {
        return this.notifications.filter((n) => n.usageContext.some((uc) => uc === userType));
    }

    public getPreLoginNotifications(userType: UserType = UserType.AGENT): PortalNotification[] {
        return this.preLoginNotifications.filter((n) => n.usageContext.some((uc) => uc === userType));
    }


}