/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectUpdatedEventData } from '../../../../model/ObjectUpdatedEventData';
import { ContextService } from './ContextService';
import { AgentSocketClient } from '../../../user/webapp/core/AgentSocketClient';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { BrowserUtil } from './BrowserUtil';

export class NotificationHandler {

    public static async handleUpdateNotifications(events: ObjectUpdatedEventData[]): Promise<void> {
        await NotificationHandler.checkForPermissionUpdate(events);
        NotificationHandler.checkForDataUpdate(events);
    }

    private static async checkForPermissionUpdate(events: ObjectUpdatedEventData[]): Promise<void> {
        const user = await AgentSocketClient.getInstance().getCurrentUser();

        let userIsAffacted = events
            .filter((e) => e.ObjectID && e.Namespace === `${KIXObjectType.ROLE}.${KIXObjectType.USER}`)
            .map((e) => Number(e.ObjectID?.split('::')[1]))
            .some((uid) => uid === user.UserID);

        userIsAffacted = userIsAffacted || events
            .filter((e) => e.Namespace === KIXObjectType.ROLE)
            .map((e) => Number(e.ObjectID))
            .some((roleId) => user.RoleIDs.some((rid) => rid === roleId));

        userIsAffacted = userIsAffacted || events
            .filter((e) => e.ObjectID && e.Namespace === `${KIXObjectType.ROLE}.${KIXObjectType.PERMISSION}`)
            .map((e) => Number(e.ObjectID?.split('::')[0]))
            .some((roleId) => user.RoleIDs.some((rid) => rid === roleId));

        if (userIsAffacted) {
            BrowserUtil.openAppRefreshOverlay('Translatable#Your Permissions have been updated.', null, true);
        }
    }

    private static checkForDataUpdate(events: ObjectUpdatedEventData[]): void {
        const updates: Array<[KIXObjectType | string, string | number]> = events.map(
            (e): [KIXObjectType | string, string | number] => {
                const objectType = this.getObjectType(e.Namespace);
                let eventObjectId = e.ObjectID;
                if (eventObjectId && typeof eventObjectId === 'string') {
                    eventObjectId = eventObjectId.split('::')[0];
                }
                return [objectType, eventObjectId];
            }
        );

        ContextService.getInstance().notifyUpdates(updates);
    }

    private static getObjectType(namespace: string): string {
        const objects = namespace?.split('.');
        if (objects.length > 1) {
            if (objects[0] === 'FAQ') {
                if (objects[1] === 'Category') {
                    return KIXObjectType.FAQ_CATEGORY;
                } else if (objects[1] === 'Article') {
                    return KIXObjectType.FAQ_ARTICLE;
                }
            } else if (objects[0] === 'CMDB') {
                return objects[1];
            }
        }

        if (objects[0] === 'State') {
            return KIXObjectType.TICKET_STATE;
        } else if (objects[0] === 'Type') {
            return KIXObjectType.TICKET_TYPE;
        }

        return objects[0];
    }

}
