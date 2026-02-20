/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RequestMethod } from '../../../../server/model/rest/RequestMethod';
import { PortalNotification } from '../../modules/portal-notification/model/PortalNotification';
import { UserType } from '../../modules/user/model/UserType';
import { APIClient } from '../APIClient';

export class NotificationsAPIClient extends APIClient {

    public static async loadNotifications(
        userType: UserType = UserType.AGENT
    ): Promise<PortalNotification[]> {
        const response = await this.executeRequest(RequestMethod.GET, `/notifications/${userType}`);
        const result = await response.json();
        return result.notifications || [];
    }

    public static async loadPreLoginNotifications(
        userType: UserType = UserType.AGENT
    ): Promise<PortalNotification[]> {
        const response = await this.executeRequest(RequestMethod.GET, `/notifications/prelogin/${userType}`);
        const result = await response.json();
        return result.notifications || [];
    }

}