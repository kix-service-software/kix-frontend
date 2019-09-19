/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from "../kix";
import {
    SystemAddress, KIXObjectType, TreeNode, NotificationProperty, SysConfigOption, SysConfigKey,
    SortUtil, DataType, TicketProperty, ArticleProperty
} from "../../model";

export class NotificationService extends KIXObjectService<SystemAddress> {

    private static INSTANCE: NotificationService = null;

    public static getInstance(): NotificationService {
        if (!NotificationService.INSTANCE) {
            NotificationService.INSTANCE = new NotificationService();
        }

        return NotificationService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.NOTIFICATION;
    }

    public getLinkObjectName(): string {
        return 'Notification';
    }

    protected async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        switch (property) {
            case NotificationProperty.DATA_VISIBLE_FOR_AGENT:
            case NotificationProperty.DATA_SEND_ONCE_A_DAY:
            case NotificationProperty.DATA_SEND_DESPITE_OOO:
            case NotificationProperty.DATA_RECIPIENT_SUBJECT:
            case NotificationProperty.DATA_CREATE_ARTICLE:
                value = Number(value);
                break;
            case NotificationProperty.DATA_RECIPIENT_EMAIL:
                value = Array.isArray(value) ? value.join(',') : value;
                break;
            case NotificationProperty.DATA_FILTER:
                if (value) {
                    for (const v of value) {
                        switch (v[0]) {
                            case TicketProperty.TYPE_ID:
                            case TicketProperty.STATE_ID:
                            case TicketProperty.PRIORITY_ID:
                            case TicketProperty.QUEUE_ID:
                            case TicketProperty.LOCK_ID:
                            case TicketProperty.ORGANISATION_ID:
                            case TicketProperty.CONTACT_ID:
                            case TicketProperty.OWNER_ID:
                            case TicketProperty.RESPONSIBLE_ID:
                                v[0] = 'Ticket::' + v[0];
                                break;
                            case ArticleProperty.SENDER_TYPE_ID:
                            case ArticleProperty.CHANNEL_ID:
                            case ArticleProperty.TO:
                            case ArticleProperty.CC:
                            case ArticleProperty.FROM:
                            case ArticleProperty.SUBJECT:
                            case ArticleProperty.BODY:
                                v[0] = 'Article::' + v[0];
                                break;
                            default:
                        }
                    }
                }
                break;
            default:

        }
        return [[property, value]];
    }

    protected async preparePredefinedValues(forUpdate: boolean): Promise<Array<[string, any]>> {
        return [
            ['Transports', ['Email']]
        ];
    }

    public async hasArticleEvent(events: string[]): Promise<boolean> {
        let hasArticleEvent = false;
        if (events) {
            const articleEventsConfig = await KIXObjectService.loadObjects<SysConfigOption>(
                KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.ARTICLE_EVENTS], null, null, true
            ).catch((error): SysConfigOption[] => []);


            if (articleEventsConfig && articleEventsConfig.length) {
                const articleEvents = articleEventsConfig[0].Value as string[];
                hasArticleEvent = events.some((e) => articleEvents.some((ae) => ae === e));
            }
        }

        return hasArticleEvent;
    }

    public async getTreeNodes(
        property: string, showInvalid?: boolean, filterIds?: Array<string | number>
    ): Promise<TreeNode[]> {
        let values: TreeNode[] = [];

        switch (property) {
            case NotificationProperty.DATA_EVENTS:
                const ticketEvents = await KIXObjectService.loadObjects<SysConfigOption>(
                    KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.TICKET_EVENTS], null, null, true
                ).catch((error): SysConfigOption[] => []);
                const articleEvents = await KIXObjectService.loadObjects<SysConfigOption>(
                    KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.ARTICLE_EVENTS], null, null, true
                ).catch((error): SysConfigOption[] => []);
                values = this.prepareEventTree(ticketEvents, articleEvents);
                break;
            default:
        }

        return values;
    }

    private prepareEventTree(ticketEvents: SysConfigOption[], articleEvents: SysConfigOption[]): TreeNode[] {
        let nodes = [];
        if (ticketEvents && ticketEvents.length) {
            nodes = ticketEvents[0].Value.map((event: string) => {
                return new TreeNode(event, event);
            });
        }
        if (articleEvents && articleEvents.length) {
            nodes = [
                ...nodes,
                ...articleEvents[0].Value.map((event: string) => {
                    return new TreeNode(event, event);
                })
            ];
        }
        return SortUtil.sortObjects(nodes, 'label', DataType.STRING);
    }
}
