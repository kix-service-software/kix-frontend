/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { BackendNotification } from '../../../../model/BackendNotification';
import { ContextService } from './ContextService';
import { AgentSocketClient } from '../../../user/webapp/core/AgentSocketClient';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { BrowserUtil } from './BrowserUtil';
import { EventService } from './EventService';
import { ApplicationEvent } from './ApplicationEvent';

export class NotificationHandler {

    public static async handleUpdateNotifications(events: BackendNotification[]): Promise<void> {
        await NotificationHandler.checkForPermissionUpdate(events);
        NotificationHandler.checkForDataUpdate(events);
        NotificationHandler.publishEvents(events);
    }

    private static async checkForPermissionUpdate(events: BackendNotification[]): Promise<void> {
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

    private static checkForDataUpdate(events: BackendNotification[]): void {
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
        if (updates.length > 0)
            EventService.getInstance().publish(ApplicationEvent.REFRESH_TOOLBAR);
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

    private static publishEvents(events: BackendNotification[]): void {
        for (const e of events) {
            let event = ApplicationEvent.OBJECT_CREATED;
            if (e.Event === 'UPDATE') {
                event = ApplicationEvent.OBJECT_UPDATED;
            } else if (e.Event === 'DELETE') {
                event = ApplicationEvent.OBJECT_DELETED;
            }

            EventService.getInstance().publish(event, e);
        }
    }

}
