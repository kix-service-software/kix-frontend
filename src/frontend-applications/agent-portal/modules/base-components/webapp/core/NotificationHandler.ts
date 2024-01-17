/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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

    private static INSTANCE: NotificationHandler;

    public static getInstance(): NotificationHandler {
        if (!NotificationHandler.INSTANCE) {
            NotificationHandler.INSTANCE = new NotificationHandler();
        }
        return NotificationHandler.INSTANCE;
    }

    private constructor() { }

    private updateTimeout: any;
    private updates: Array<[KIXObjectType | string, string | number]> = [];

    public async handleUpdateNotifications(events: BackendNotification[]): Promise<void> {
        await this.checkForPermissionUpdate(events);
        this.checkForDataUpdate(events);
        this.publishEvents(events);
    }

    private async checkForPermissionUpdate(events: BackendNotification[]): Promise<void> {
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

    private checkForDataUpdate(events: BackendNotification[]): void {
        for (const e of events) {
            const objectType = this.getObjectType(e.Namespace);
            let eventObjectId = e.ObjectID;
            if (eventObjectId && typeof eventObjectId === 'string') {
                eventObjectId = eventObjectId.split('::')[0];
            }

            if (!this.updates.some((u) => u[0] === objectType && u[1] === eventObjectId)) {
                this.updates.push([objectType, eventObjectId]);
            }
        }

        if (this.updateTimeout) {
            window.clearTimeout(this.updateTimeout);
        }

        this.updateTimeout = setTimeout(() => {
            ContextService.getInstance().notifyUpdates(this.updates);
            this.updates = [];
        }, 3000);
    }

    private getObjectType(namespace: string): string {
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

    private publishEvents(events: BackendNotification[]): void {
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
