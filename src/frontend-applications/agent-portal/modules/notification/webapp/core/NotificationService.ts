/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { SystemAddress } from '../../../system-address/model/SystemAddress';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { NotificationProperty } from '../../model/NotificationProperty';
import { SysConfigOption } from '../../../sysconfig/model/SysConfigOption';
import { SysConfigKey } from '../../../sysconfig/model/SysConfigKey';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { Notification } from '../../model/Notification';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';

export class NotificationService extends KIXObjectService<SystemAddress> {

    private static INSTANCE: NotificationService = null;

    public static getInstance(): NotificationService {
        if (!NotificationService.INSTANCE) {
            NotificationService.INSTANCE = new NotificationService();
        }

        return NotificationService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.NOTIFICATION);
        this.objectConstructors.set(KIXObjectType.NOTIFICATION, [Notification]);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.NOTIFICATION;
    }

    public getLinkObjectName(): string {
        return 'Notification';
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType | string, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache: boolean = true, forceIds?: boolean
    ): Promise<O[]> {
        const notififactions = await super.loadObjects<Notification>(
            objectType, objectIds, loadingOptions, objectLoadingOptions, cache, forceIds
        );

        for (const notification of notififactions) {
            await this.prepareNotificationData(notification);
        }

        return notififactions as any[];
    }

    private async prepareNotificationData(notification: Notification): Promise<void> {
        if (notification.Data) {
            for (const key in notification.Data) {
                if (key && Array.isArray(notification.Data[key])) {
                    const value = notification.Data[key];
                    switch (key) {
                        case NotificationProperty.DATA_VISIBLE_FOR_AGENT:
                            notification.VisibleForAgent = Boolean(Number(value[0]));
                            break;
                        case NotificationProperty.DATA_VISIBLE_FOR_AGENT_TOOLTIP:
                            notification.VisibleForAgentTooltip = value[0];
                            break;
                        case NotificationProperty.DATA_RECIPIENTS:
                            notification.Recipients = value;
                            break;
                        case NotificationProperty.DATA_EVENTS:
                            notification.Events = value;
                            break;
                        case NotificationProperty.DATA_RECIPIENT_AGENTS:
                            notification.RecipientAgents = value.map((v) => Number(v));
                            break;
                        case NotificationProperty.DATA_RECIPIENT_EMAIL:
                            notification.RecipientEmail = value[0].split(/,\s?/);
                            break;
                        case NotificationProperty.DATA_RECIPIENT_ROLES:
                            notification.RecipientRoles = value.map((v) => Number(v));
                            break;
                        case NotificationProperty.DATA_RECIPIENT_SUBJECT:
                            notification.RecipientSubject = Boolean(Number(value[0]));
                            break;
                        case NotificationProperty.DATA_SEND_DESPITE_OOO:
                            notification.SendOnOutOfOffice = Boolean(Number(value[0]));
                            break;
                        case NotificationProperty.DATA_SEND_ONCE_A_DAY:
                            notification.OncePerDay = Boolean(Number(value[0]));
                            break;
                        case NotificationProperty.DATA_CREATE_ARTICLE:
                            notification.CreateArticle = Boolean(Number(value[0]));
                            break;
                        default:
                    }
                }
            }
        }
    }

    public async hasArticleEvent(events: string[]): Promise<boolean> {
        let hasArticleEvent = false;
        if (events) {
            const articleEventsConfig = await KIXObjectService.loadObjects<SysConfigOption>(
                KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.ARTICLE_EVENTS], null, null, true
            ).catch((error): SysConfigOption[] => []);

            if (articleEventsConfig && articleEventsConfig.length) {
                const articleEvents = articleEventsConfig[0].Value as string[];
                hasArticleEvent = events.some(
                    (e) => articleEvents.some((ae) => ae === e) || e === 'ArticleDynamicFieldUpdate'
                );
            }
        }

        return hasArticleEvent;
    }

    public async getTreeNodes(
        property: string, showInvalid?: boolean, invalidClickable?: boolean, filterIds?: Array<string | number>
    ): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];

        switch (property) {
            case NotificationProperty.DATA_EVENTS:
                nodes = await super.getTicketArticleEventTree();
                break;
            default:
        }

        return nodes;
    }
}
