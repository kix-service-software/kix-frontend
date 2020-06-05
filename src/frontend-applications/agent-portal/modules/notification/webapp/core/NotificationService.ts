/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
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

export class NotificationService extends KIXObjectService<SystemAddress> {

    private static INSTANCE: NotificationService = null;

    public static getInstance(): NotificationService {
        if (!NotificationService.INSTANCE) {
            NotificationService.INSTANCE = new NotificationService();
        }

        return NotificationService.INSTANCE;
    }

    private constructor() {
        super();
        this.objectConstructors.set(KIXObjectType.NOTIFICATION, [Notification]);
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
