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