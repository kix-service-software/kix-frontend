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
import { ContextType } from '../../../../model/ContextType';
import { AgentSocketClient } from '../../../user/webapp/core/AgentSocketClient';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { BrowserUtil } from './BrowserUtil';
import { ContextMode } from '../../../../model/ContextMode';
import { Context } from '../../../../model/Context';
import { AdditionalContextInformation } from './AdditionalContextInformation';

export class NotificationHandler {

    public static async handleUpdateNotifications(events: ObjectUpdatedEventData[]): Promise<void> {
        const activeContext = ContextService.getInstance().getActiveContext();
        if (activeContext && activeContext.getDescriptor().contextType === ContextType.MAIN) {
            await NotificationHandler.checkForPermissionUpdate(activeContext, events);
            NotificationHandler.checkForDataUpdate(activeContext, events);
        }
    }

    private static async checkForPermissionUpdate(context: Context, events: ObjectUpdatedEventData[]): Promise<void> {
        const user = await AgentSocketClient.getInstance().getCurrentUser();

        let userIsAffacted = events
            .filter((e) => e.Namespace === `${KIXObjectType.ROLE}.${KIXObjectType.USER}`)
            .map((e) => Number(e.ObjectID.split('::')[1]))
            .some((uid) => uid === user.UserID);

        userIsAffacted = userIsAffacted || events
            .filter((e) => e.Namespace === KIXObjectType.ROLE)
            .map((e) => Number(e.ObjectID))
            .some((roleId) => user.RoleIDs.some((rid) => rid === roleId));

        userIsAffacted = userIsAffacted || events
            .filter((e) => e.Namespace === `${KIXObjectType.ROLE}.${KIXObjectType.PERMISSION}`)
            .map((e) => Number(e.ObjectID.split('::')[0]))
            .some((roleId) => user.RoleIDs.some((rid) => rid === roleId));

        if (userIsAffacted) {
            BrowserUtil.openAppRefreshOverlay('Translatable#Your Permissions have been updated.', null, true);
        }
    }

    private static checkForDataUpdate(context: Context, events: ObjectUpdatedEventData[]): void {
        if (!context.getAdditionalInformation(AdditionalContextInformation.DONT_SHOW_UPDATE_NOTIFICATION)) {
            let showRefreshNotification = false;
            let notifiactionObjectType: KIXObjectType | string;

            if (context.getDescriptor().contextMode === ContextMode.DETAILS) {
                showRefreshNotification = events.some((e) => {
                    const objectType = this.getObjectType(e.Namespace);
                    const isObjectType = context.getDescriptor().kixObjectTypes.some((ot) => ot === objectType);
                    const eventObjectId = e.ObjectID && typeof e.ObjectID === 'string'
                        ? e.ObjectID.split('::')
                        : [];
                    const isObject = eventObjectId[0] === context.getObjectId().toString();
                    if (isObjectType && isObject) {
                        notifiactionObjectType = objectType;
                        return true;
                    }
                    return false;
                });
            } else if (context.getDescriptor().contextMode === ContextMode.DASHBOARD) {
                showRefreshNotification = events.some((e) => {
                    const objectType = this.getObjectType(e.Namespace);
                    const isObjectType = context.getDescriptor().kixObjectTypes.some((ot) => ot === objectType);
                    if (isObjectType) {
                        notifiactionObjectType = objectType;
                        return true;
                    }
                    return false;
                });
            }

            if (showRefreshNotification) {
                BrowserUtil.openAppRefreshOverlay('Translatable#Data has been updated.', notifiactionObjectType);
            }
        }
    }

    private static getObjectType(namespace: string): string {
        const objects = namespace.split('.');
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
