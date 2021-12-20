/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { Queue } from '../../../model/Queue';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../../model/KIXObjectSpecificLoadingOptions';
import { QueueProperty } from '../../../model/QueueProperty';
import { TreeNode, TreeNodeProperty } from '../../../../base-components/webapp/core/tree';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { FollowUpType } from '../../../model/FollowUpType';
import { SortUtil } from '../../../../../model/SortUtil';
import { DataType } from '../../../../../model/DataType';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';

export class QueueService extends KIXObjectService<Queue> {

    private static INSTANCE: QueueService = null;

    public static getInstance(): QueueService {
        if (!QueueService.INSTANCE) {
            QueueService.INSTANCE = new QueueService();
        }

        return QueueService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.QUEUE);
        this.objectConstructors.set(KIXObjectType.QUEUE, [Queue]);
        this.objectConstructors.set(KIXObjectType.FOLLOW_UP_TYPE, [FollowUpType]);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.QUEUE
            || kixObjectType === KIXObjectType.FOLLOW_UP_TYPE;
    }

    public getLinkObjectName(): string {
        return 'Queue';
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let objects: O[];
        let superLoad = false;
        if (objectType === KIXObjectType.FOLLOW_UP_TYPE) {
            objects = await super.loadObjects<O>(KIXObjectType.FOLLOW_UP_TYPE, null, loadingOptions);
        } else {
            if (!loadingOptions) {
                objects = await super.loadObjects<O>(objectType, null);
            } else {
                superLoad = true;
                objects = await super.loadObjects<O>(objectType, objectIds, loadingOptions, objectLoadingOptions);
            }
        }

        if (objectIds && !superLoad) {
            objects = objects.filter((c) => objectIds.map((id) => Number(id)).some((oid) => c.ObjectId === oid));
        }

        return objects;
    }

    public async prepareObjectTree(
        queues: Queue[], showInvalid?: boolean, invalidClickable: boolean = false,
        filterIds?: number[], translatable?: boolean, includeTicketStats: boolean = false
    ): Promise<TreeNode[]> {
        const nodes = [];
        if (queues && !!queues.length) {
            if (!showInvalid) {
                queues = queues.filter((q) => q.ValidID === 1);
            } else if (!invalidClickable) {
                queues = queues.filter((q) => q.ValidID === 1 || this.hasValidDescendants(q.SubQueues));
            }

            if (filterIds && filterIds.length) {
                queues = queues.filter((q) => !filterIds.some((fid) => fid === q.QueueID));
            }

            for (const queue of queues) {
                let ticketStats = null;
                if (includeTicketStats) {
                    ticketStats = await this.getTicketStats(queue);
                }

                const subTree = await this.prepareObjectTree(
                    queue.SubQueues, showInvalid, invalidClickable, filterIds, translatable, includeTicketStats
                );

                const icon = LabelService.getInstance().getObjectIcon(queue);

                const treeNode = new TreeNode(queue.QueueID, queue.Name, icon);
                treeNode.children = subTree;
                treeNode.properties = ticketStats;
                treeNode.selectable = invalidClickable ? true : queue.ValidID === 1;
                treeNode.showAsInvalid = queue.ValidID !== 1;

                nodes.push(treeNode);
            }
        }

        SortUtil.sortObjects(nodes, 'label', DataType.STRING);

        return nodes;
    }

    private hasValidDescendants(queues: Queue[]): boolean {
        let hasValidDescendants: boolean = false;
        if (queues && !!queues.length) {
            for (const queue of queues) {
                if (queue.ValidID === 1) {
                    hasValidDescendants = true;
                } else {
                    hasValidDescendants = this.hasValidDescendants(queue.SubQueues);
                }
                if (hasValidDescendants) {
                    break;
                }
            }
        }
        return hasValidDescendants;
    }

    private async getTicketStats(queue: Queue): Promise<TreeNodeProperty[]> {
        const properties: TreeNodeProperty[] = [];
        if (queue.TicketStats) {
            const totalCount = queue.TicketStats.TotalCount;
            const totalTooltip = await TranslationService.translate('Translatable#All tickets', [totalCount]);

            const freeCount = totalCount - queue.TicketStats.LockCount;
            const freeTooltip = await TranslationService.translate(
                'Translatable#All free tickets', [totalCount - freeCount]
            );

            properties.push(new TreeNodeProperty(freeCount, freeTooltip));
            properties.push(new TreeNodeProperty(totalCount, totalTooltip));
        }

        return properties;
    }

    public async getQueuesHierarchy(withData: boolean = true): Promise<Queue[]> {
        const loadingOptions = new KIXObjectLoadingOptions(
            [
                new FilterCriteria(
                    QueueProperty.PARENT_ID, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, null
                )
            ],
            null, null,
            withData ? [QueueProperty.SUB_QUEUES, 'TicketStats'] : [QueueProperty.SUB_QUEUES],
            [QueueProperty.SUB_QUEUES],
            withData ? [['TicketStats.StateType', 'Open']] : undefined
        );

        return await KIXObjectService.loadObjects<Queue>(KIXObjectType.QUEUE, null, loadingOptions);
    }

    public async getTreeNodes(
        property: string, showInvalid?: boolean, invalidClickable?: boolean,
        filterIds?: Array<string | number>, loadingOptions?: KIXObjectLoadingOptions
    ): Promise<TreeNode[]> {
        const values: TreeNode[] = [];

        switch (property) {
            case QueueProperty.FOLLOW_UP_ID:
                let followUpTypes = await KIXObjectService.loadObjects<FollowUpType>(KIXObjectType.FOLLOW_UP_TYPE);
                if (!showInvalid) {
                    followUpTypes = followUpTypes.filter((q) => q.ValidID === 1);
                }
                for (const type of followUpTypes) {
                    values.push(new TreeNode(type.ID, await TranslationService.translate(type.Name)));
                }
                break;
            default:
        }

        return values;
    }
}
