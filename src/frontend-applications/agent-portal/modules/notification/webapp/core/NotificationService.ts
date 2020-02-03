/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from "../../../../modules/base-components/webapp/core/KIXObjectService";
import { SystemAddress } from "../../../system-address/model/SystemAddress";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { NotificationProperty } from "../../model/NotificationProperty";
import { SysConfigOption } from "../../../sysconfig/model/SysConfigOption";
import { SysConfigKey } from "../../../sysconfig/model/SysConfigKey";
import { TreeNode } from "../../../base-components/webapp/core/tree";
import { SortUtil } from "../../../../model/SortUtil";
import { DataType } from "../../../../model/DataType";


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
        property: string, showInvalid?: boolean, invalidClickable?: boolean, filterIds?: Array<string | number>
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
